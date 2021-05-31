<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

/**
 * App\Models\BlockedUser
 *
 * @property int $id
 * @property int $blocked_by
 * @property int $blocked_to
 * @property \Illuminate\Support\Carbon|null $created_at
 * @property \Illuminate\Support\Carbon|null $updated_at
 * @method static \Illuminate\Database\Eloquent\Builder|\App\Models\BlockedUser newModelQuery()
 * @method static \Illuminate\Database\Eloquent\Builder|\App\Models\BlockedUser newQuery()
 * @method static \Illuminate\Database\Eloquent\Builder|\App\Models\BlockedUser query()
 * @method static \Illuminate\Database\Eloquent\Builder|\App\Models\BlockedUser whereBlockedBy($value)
 * @method static \Illuminate\Database\Eloquent\Builder|\App\Models\BlockedUser whereBlockedTo($value)
 * @method static \Illuminate\Database\Eloquent\Builder|\App\Models\BlockedUser whereCreatedAt($value)
 * @method static \Illuminate\Database\Eloquent\Builder|\App\Models\BlockedUser whereId($value)
 * @method static \Illuminate\Database\Eloquent\Builder|\App\Models\BlockedUser whereUpdatedAt($value)
 * @mixin \Eloquent
 * @property-write mixed $raw
 */
class BlockedUser extends Model
{
    public $table = 'blocked_users';

    public $fillable = [
        'blocked_by',
        'blocked_to',
    ];

    protected $casts = [
        'blocked_by' => 'integer',
        'blocked_to' => 'integer',
    ];
}
