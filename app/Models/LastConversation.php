<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

/**
 * App\Models\LastConversation
 *
 * @property int $id
 * @property string $group_id
 * @property int $conversation_id
 * @property int $user_id
 * @property array $group_details
 * @property \Illuminate\Support\Carbon|null $created_at
 * @property \Illuminate\Support\Carbon|null $updated_at
 * @property-read \App\Models\Conversation $conversation
 * @property-write mixed $raw
 * @method static \Illuminate\Database\Eloquent\Builder|\App\Models\LastConversation newModelQuery()
 * @method static \Illuminate\Database\Eloquent\Builder|\App\Models\LastConversation newQuery()
 * @method static \Illuminate\Database\Eloquent\Builder|\App\Models\LastConversation query()
 * @method static \Illuminate\Database\Eloquent\Builder|\App\Models\LastConversation whereConversationId($value)
 * @method static \Illuminate\Database\Eloquent\Builder|\App\Models\LastConversation whereCreatedAt($value)
 * @method static \Illuminate\Database\Eloquent\Builder|\App\Models\LastConversation whereGroupDetails($value)
 * @method static \Illuminate\Database\Eloquent\Builder|\App\Models\LastConversation whereGroupId($value)
 * @method static \Illuminate\Database\Eloquent\Builder|\App\Models\LastConversation whereId($value)
 * @method static \Illuminate\Database\Eloquent\Builder|\App\Models\LastConversation whereUpdatedAt($value)
 * @method static \Illuminate\Database\Eloquent\Builder|\App\Models\LastConversation whereUserId($value)
 * @mixin \Eloquent
 */
class LastConversation extends Model
{
    protected $table = 'last_conversations';

    protected $fillable = ['user_id', 'group_id', 'conversation_id', 'group_details'];

    protected $casts = [
        'user_id'         => 'integer',
        'group_id'        => 'string',
        'conversation_id' => 'integer',
        'group_details'   => 'json',
    ];

    /**
     * @return \Illuminate\Database\Eloquent\Relations\HasOne
     */
    public function conversation()
    {
        return $this->hasOne(Conversation::class, 'id', 'conversation_id');
    }
}