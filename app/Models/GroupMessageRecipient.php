<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

/**
 * Class GroupMessageRecipients
 *
 * @property int $id
 * @property int $user_id
 * @property int $conversation_id
 * @property \Illuminate\Support\Carbon|null $read_at
 * @property \Illuminate\Support\Carbon|null $created_at
 * @property \Illuminate\Support\Carbon|null $updated_at
 * @property-write mixed $raw
 * @method static \Illuminate\Database\Eloquent\Builder|\App\Models\GroupMessageRecipient newModelQuery()
 * @method static \Illuminate\Database\Eloquent\Builder|\App\Models\GroupMessageRecipient newQuery()
 * @method static \Illuminate\Database\Eloquent\Builder|\App\Models\GroupMessageRecipient query()
 * @method static \Illuminate\Database\Eloquent\Builder|\App\Models\GroupMessageRecipient whereConversationId($value)
 * @method static \Illuminate\Database\Eloquent\Builder|\App\Models\GroupMessageRecipient whereCreatedAt($value)
 * @method static \Illuminate\Database\Eloquent\Builder|\App\Models\GroupMessageRecipient whereId($value)
 * @method static \Illuminate\Database\Eloquent\Builder|\App\Models\GroupMessageRecipient whereReadAt($value)
 * @method static \Illuminate\Database\Eloquent\Builder|\App\Models\GroupMessageRecipient whereUpdatedAt($value)
 * @method static \Illuminate\Database\Eloquent\Builder|\App\Models\GroupMessageRecipient whereUserId($value)
 * @mixin \Eloquent
 * @property string $group_id
 * @property-read \App\Models\Conversation $conversation
 * @method static \Illuminate\Database\Eloquent\Builder|\App\Models\GroupMessageRecipient whereGroupId($value)
 */
class GroupMessageRecipient extends Model
{
    protected $table = 'group_message_recipients';
    protected $fillable = [
        'user_id', 'conversation_id', 'group_id', 'read_at',
    ];

    protected $casts = [
        'user_id'         => 'integer',
        'group_id'        => 'string',
        'conversation_id' => 'integer',
        'read_at'         => 'datetime',
    ];

    public function conversation()
    {
        return $this->belongsTo(Conversation::class, 'conversation_id');
    }
}