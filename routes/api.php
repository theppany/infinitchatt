<?php

use Illuminate\Http\Request;

/*
|--------------------------------------------------------------------------
| API Routes
|--------------------------------------------------------------------------
|
| Here is where you can register API routes for your application. These
| routes are loaded by the RouteServiceProvider within a group which
| is assigned the "api" middleware group. Enjoy building your API!
|
*/

Route::middleware('auth:api')->get('/user', function (Request $request) {
    return $request->user();
});

// User Login API
Route::post('/login', 'AuthAPIController@login');
Route::post('/register', 'AuthAPIController@register');
Route::post('password/reset', 'PasswordResetController@sendResetPasswordLink');
Route::post('password/update', 'PasswordResetController@reset');
Route::get('activate', 'AuthAPIController@verifyAccount');

Route::group(['middleware' => ['auth:api', 'user.activated']], function () {
    Route::post('broadcasting/auth', '\Illuminate\Broadcasting\BroadcastController@authenticate');
    Route::get('logout', 'AuthAPIController@logout');

    //get all user list for chat
    Route::get('users-list', 'UserAPIController@getUsersList');
    Route::post('change-password', 'UserAPIController@changePassword');

    Route::get('profile', 'UserAPIController@getProfile')->name('my-profile');
    Route::post('profile', 'UserAPIController@updateProfile');
    Route::post('update-last-seen', 'UserAPIController@updateLastSeen');

    Route::post('send-message', 'ChatAPIController@sendMessage')->name('conversations.store');
    Route::get('users/{id}/conversation', 'UserAPIController@getConversation');
    Route::get('conversations', 'ChatAPIController@getLatestConversations');
    Route::post('read-message', 'ChatAPIController@updateConversationStatus');
    Route::post('file-upload', 'ChatAPIController@addAttachment')->name('file-upload');
    Route::get('conversations/{userId}/delete', 'ChatAPIController@deleteConversation');

    /** Update Web-push */
    Route::put('update-web-notifications', 'UserAPIController@updateNotification');

    /** create group **/
    Route::post('groups', 'GroupAPIController@create')->name('create-group');
    /** Social Login */
    Route::post('social-login/{provider}', 'SocialAuthAPIController@socialLogin')->middleware('web');
});

Route::group(['middleware' => ['role:Admin', 'auth:api', 'user.activated']], function () {
    Route::resource('users', 'AdminUsersAPIController');
    Route::post('users/{user}/update', 'AdminUsersAPIController@update');
    Route::post('users/{user}/active-de-active', 'AdminUsersAPIController@activeDeActiveUser')
        ->name('active-de-active-user');

    Route::resource('roles', 'RoleAPIController');
    Route::post('roles/{role}/update', 'RoleAPIController@update');
});
