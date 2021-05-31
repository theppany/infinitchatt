<?php

namespace App\Http\Controllers;

use App\Models\User;
use Illuminate\Contracts\View\Factory;
use Illuminate\Http\Request;
use Illuminate\View\View;

/**
 * Class ChatController
 * @package App\Http\Controllers
 */
class ChatController extends AppBaseController
{
    /**
     * Show the application dashboard.
     *
     * @param Request $request
     *
     * @return Factory|View
     */
    public function index(Request $request)
    {
        $conversationId = $request->get('conversationId');
        $data['conversationId'] = !empty($conversationId) ? $conversationId : 0;

        $data['users'] = User::orderBy('name')->pluck('name', 'id')->except(getLoggedInUserId());
        $data['enableGroupSetting'] = isGroupChatEnabled();

        return view('chat.index')->with($data);
    }
}
