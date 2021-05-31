<?php

namespace App\Models;

use Eloquent as Model;

/**
 * App\Models\MessageAction
 *
 * @property int $id
 * @property int $conversation_id
 * @property int $deleted_by
 * @property \Illuminate\Support\Carbon|null $created_at
 * @property \Illuminate\Support\Carbon|null $updated_at
 * @method static \Illuminate\Database\Eloquent\Builder|\App\Models\MessageAction newModelQuery()
 * @method static \Illuminate\Database\Eloquent\Builder|\App\Models\MessageAction newQuery()
 * @method static \Illuminate\Database\Eloquent\Builder|\App\Models\MessageAction query()
 * @method static \Illuminate\Database\Eloquent\Builder|\App\Models\MessageAction whereConversationId($value)
 * @method static \Illuminate\Database\Eloquent\Builder|\App\Models\MessageAction whereCreatedAt($value)
 * @method static \Illuminate\Database\Eloquent\Builder|\App\Models\MessageAction whereDeletedBy($value)
 * @method static \Illuminate\Database\Eloquent\Builder|\App\Models\MessageAction whereId($value)
 * @method static \Illuminate\Database\Eloquent\Builder|\App\Models\MessageAction whereUpdatedAt($value)
 * @mixin \Eloquent
 * @property int $is_hard_delete
 * @method static \Illuminate\Database\Eloquent\Builder|\App\Models\MessageAction whereIsHardDelete($value)
 * @property-write mixed $raw
 */
class MessageAction extends Model
{
    public $table = 'message_action';

    public $fillable = [
        'conversation_id',
        'deleted_by',
        'is_hard_delete',
    ];

    public static $rules = [
        'conversation_id' => 'required|integer',
        'deleted_by' => 'required|integer',
    ];
}
