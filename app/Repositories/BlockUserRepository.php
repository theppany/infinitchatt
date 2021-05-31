<?php

namespace App\Repositories;

use App\Events\UserEvent;
use App\Models\BlockedUser;
use App\Models\Role;
use App\Models\User;
use Auth;
use Exception;
use Symfony\Component\HttpKernel\Exception\UnprocessableEntityHttpException;

/**
 * Class BlockUserRepository
 */
class BlockUserRepository extends BaseRepository
{
    /**
     * @var array
     */
    protected $fieldSearchable = [
        'blocked_by',
        'blocked_to',
    ];

    /**
     * Return searchable fields
     *
     * @return array
     */
    public function getFieldsSearchable()
    {
        return $this->fieldSearchable;
    }

    /**
     * Configure the Model
     **/
    public function model()
    {
        return BlockedUser::class;
    }

    /**
     * @param  array  $input
     *
     * @throws Exception
     *
     * @return bool|null
     */
    public function blockUnblockUser($input)
    {
        /** @var User $blockedTo */
        $blockedTo = User::findOrFail($input['blocked_to']);
        if ($blockedTo->hasRole(Role::ADMIN_ROLE_NAME)) {
            throw new UnprocessableEntityHttpException('You can not block admin user.');
        }

        /** @var BlockedUser $blockedUser */
        $blockedUser = BlockedUser::whereBlockedBy($input['blocked_by'])->whereBlockedTo($input['blocked_to'])->first();

        broadcast(new UserEvent([
            'blockedBy' => Auth::user(),
            'blockedTo' => $blockedTo,
            'isBlocked' => $input['is_blocked'],
            'type'      => User::BLOCK_UNBLOCK_EVENT,
        ], $blockedTo->id))->toOthers();

        if ($input['is_blocked'] == false && ! empty($blockedUser)) {
            return $blockedUser->delete();
        }

        BlockedUser::create($input);

        return true;
    }
}