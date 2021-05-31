<?php
/**
 * Company: InfyOm Technologies, Copyright 2019, All Rights Reserved.
 *
 * User: Monika Vaghasiya
 * Email: monika.vaghasiya@infyom.com
 * Date: 11/13/2019
 * Time: 01:14 PM
 */

namespace App\Queries;

use App\Models\User;
use Illuminate\Database\Eloquent\Builder;

/**
 * Class UserDataTable.
 */
class UserDataTable
{
    /**
     * @param array $input
     * 
     * @return Builder
     */
    public function get($input = [])
    {
        $users = User::with(['roles']);
        $users->when(
            isset($input['filter_user']),
            function (Builder $q) use ($input) {
                if ($input['filter_user'] == User::FILTER_ARCHIVE) {
                    $q->onlyTrashed();
                }
                if ($input['filter_user'] == User::FILTER_ALL) {
                    $q->withTrashed();
                }
                if ($input['filter_user'] == User::FILTER_ACTIVE) {
                    $q->where('is_active', '=', 1);
                }
                if ($input['filter_user'] == User::FILTER_INACTIVE) {
                    $q->where('is_active', '=', 0);
                }
            }
        );
        $users = $users->get()->except(getLoggedInUserId());
        foreach ($users as $key => $user) {
            /** @var User $user */
            $users[$key] = $user->apiObj();
        }

        return $users;
    }
}
