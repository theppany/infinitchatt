<?php

namespace App\Http\Controllers\API;

use App\Http\Controllers\AppBaseController;
use App\Models\BlockedUser;
use App\Models\User;
use App\Repositories\BlockUserRepository;
use Auth;
use Exception;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

/**
 * Class BlockUserController
 */
class BlockUserAPIController extends AppBaseController
{
    /**
     * @var BlockUserRepository
     */
    private $blockUserRepository;

    public function __construct(BlockUserRepository $blockUserRepository)
    {
        $this->blockUserRepository = $blockUserRepository;
    }

    /**
     * @param  Request  $request
     *
     * @throws Exception
     *
     * @return JsonResponse
     */
    public function blockUnblockUser(Request $request)
    {
        $input = $request->all();

        $input['blocked_by'] = Auth::id();
        $input['is_blocked'] = ($input['is_blocked'] == 'false') ? false : true;
        $blockText = ($input['is_blocked'] == true) ? 'blocked' : 'unblocked';
        $blockedTo = User::findOrFail($input['blocked_to']);

        $this->blockUserRepository->blockUnblockUser($input);

        return $this->sendResponse(['user' => $blockedTo], "User $blockText successfully.");
    }

    /**
     * @return mixed
     */
    public function blockedUsers()
    {
        $blockedUserIds = BlockedUser::whereBlockedBy(Auth::id())
            ->orWhere('blocked_to', Auth::id())
            ->pluck('blocked_by', 'blocked_to')
            ->toArray();

        $blockedUserIds = array_unique(array_merge($blockedUserIds, array_keys($blockedUserIds)));

        return $this->sendResponse(
            ['users_ids' => $blockedUserIds], 'Blocked users retrieved successfully.'
        );
    }

    /**
     * @return JsonResponse
     */
    public function blockUsersByMe()
    {
        $blockedUserIds = BlockedUser::whereBlockedBy(Auth::id())->pluck('blocked_to')->toArray();

        $users = User::whereIn('id', $blockedUserIds)->get();

        return $this->sendResponse(
            ['users' => $users], 'Blocked users retrieved successfully.'
        );
    }
}