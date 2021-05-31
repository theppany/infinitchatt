<?php

namespace App\Http\Controllers\API;

use App\Http\Controllers\AppBaseController;
use App\Http\Requests\ChangePasswordRequest;
use App\Http\Requests\CreateUserStatusRequest;
use App\Http\Requests\UpdateUserNotificationRequest;
use App\Http\Requests\UpdateUserProfileRequest;
use App\Models\ArchivedUser;
use App\Models\BlockedUser;
use App\Models\Group;
use App\Models\User;
use App\Repositories\UserRepository;
use Auth;
use Carbon\Carbon;
use Exception;
use Hash;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

/**
 * Class UserAPIController
 */
class UserAPIController extends AppBaseController
{
    /** @var UserRepository */
    private $userRepository;

    /**
     * Create a new controller instance.
     *
     * @param  UserRepository  $userRepository
     */
    public function __construct(UserRepository $userRepository)
    {
        $this->userRepository = $userRepository;
    }

    /**
     * @return JsonResponse
     */
    public function getUsersList()
    {
        $myContactIds = $this->userRepository->myContactIds();
        $userIds = BlockedUser::orwhere('blocked_by', getLoggedInUserId())
            ->orWhere('blocked_to', getLoggedInUserId())
            ->pluck('blocked_by', 'blocked_to')
            ->toArray();

        $userIds = array_unique(array_merge($userIds, array_keys($userIds)));
        $userIds = array_unique(array_merge($userIds, $myContactIds));

        $users = User::whereNotIn('id', $userIds)->orderBy('name', 'asc')->get()->except(getLoggedInUserId());

        return $this->sendResponse(['users' => $users], 'Users retrieved successfully.');
    }

    /**
     * @return JsonResponse
     */
    public function getUsers()
    {
        $users = User::orderBy('name', 'asc')->get()->except(getLoggedInUserId());

        return $this->sendResponse(['users' => $users], 'Users retrieved successfully.');
    }

    /**
     * @return JsonResponse
     */
    public function getProfile()
    {
        /** @var User $authUser * */
        $authUser = getLoggedInUser();
        $authUser->roles;
        $authUser = $authUser->apiObj();

        return $this->sendResponse(['user' => $authUser], 'Users retrieved successfully.');
    }

    /**
     * @param  UpdateUserProfileRequest  $request
     *
     * @return JsonResponse
     */
    public function updateProfile(UpdateUserProfileRequest $request)
    {
        try {
            $this->userRepository->updateProfile($request->all());

            return $this->sendSuccess('Profile updated successfully.');
        } catch (Exception $e) {
            return $this->sendError($e->getMessage());
        }
    }

    /**
     * @param  Request  $request
     *
     * @return JsonResponse
     */
    public function updateLastSeen(Request $request)
    {
        /** @var User $user */
        $user = $request->user();

        $lastSeen = ($request->has('status') && $request->get('status') > 0) ? null : Carbon::now();

        $user->update(['last_seen' => $lastSeen, 'is_online' => $request->get('status')]);

        return $this->sendResponse(['user' => $user], 'Last seen updated successfully.');
    }

    /**
     * @param  int  $id
     * @param  Request  $request
     *
     * @return JsonResponse
     */
    public function getConversation($id, Request $request)
    {
        $input = $request->all();
        $data = $this->userRepository->getConversation($id, $input);

        return $this->sendResponse($data, 'Conversation retrieved successfully.');
    }

    /**
     * @param  ChangePasswordRequest  $request
     *
     * @return JsonResponse
     */
    public function changePassword(ChangePasswordRequest $request)
    {
        /** @var User $user */
        $user = Auth::user();
        $input = $request->all();

        $input['password'] = Hash::make($input['password']);

        $user->update(['password' => $input['password']]);

        return $this->sendSuccess('Password updated successfully.');
    }

    /**
     * @param  UpdateUserNotificationRequest  $request
     *
     * @return JsonResponse
     */
    public function updateNotification(UpdateUserNotificationRequest $request)
    {
        $input = $request->all();
        $input['is_subscribed'] = ($input['is_subscribed'] == 'true') ? true : false;

        $this->userRepository->storeAndUpdateNotification($input);

        return $this->sendSuccess('Notification updated successfully.');
    }

    /**
     * @return JsonResponse
     */
    public function removeProfileImage()
    {
        /** @var User $user */
        $user = Auth::user();

        $user->deleteImage();

        return $this->sendSuccess('Profile image deleted successfully.');
    }

    /**
     * @param $ownerId
     *
     * @throws Exception
     *
     * @return JsonResponse
     */
    public function archiveChat($ownerId)
    {
        $archivedUser = ArchivedUser::whereOwnerId($ownerId)->whereArchivedBy(getLoggedInUserId())->first();
        if (is_string($ownerId) && ! is_numeric($ownerId)) {
            $ownerType = Group::class;
        } else {
            $ownerType = User::class;
        }

        if (empty($archivedUser)) {
            ArchivedUser::create([
                'owner_id'    => $ownerId,
                'owner_type'  => $ownerType,
                'archived_by' => getLoggedInUserId(),
            ]);
        } else {
            $archivedUser->delete();

            return $this->sendResponse(['archived' => false], 'Chat unarchived successfully.');
        }

        return $this->sendResponse(['archived' => true], 'Chat archived successfully.');
    }

    /**
     * @param CreateUserStatusRequest $request
     *
     * @return JsonResponse
     */
    public function setUserCustomStatus(CreateUserStatusRequest $request)
    {
        $input = $request->only(['emoji', 'status', 'emoji_short_name']);

        $userStatus = $this->userRepository->setUserCustomStatus($input);

        return $this->sendResponse($userStatus, 'Your status set successfully.');
    }

    /**
     * @throws Exception
     *
     * @return JsonResponse
     */
    public function clearUserCustomStatus()
    {
        $this->userRepository->clearUserCustomStatus();

        return $this->sendSuccess('Your status cleared successfully.');
    }
    
     /*
     * @return JsonResponse
     */
    public function myContacts()
    {
        $myContactIds = $this->userRepository->myContactIds();

        $users = User::with('userStatus')->whereIn('id', $myContactIds)->orderBy('name', 'asc')->get();

        return $this->sendResponse(['users' => $users, 'myContactIds' => $myContactIds],
            'Users retrieved successfully.');
    }
}
