<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

/**
 * App\Models\GroupUser
 *
 * @property int $id
 * @property int $group_id
 * @property int $user_id
 * @property int $role
 * @property int $added_by
 * @property \Illuminate\Support\Carbon|null $created_at
 * @property \Illuminate\Support\Carbon|null $updated_at
 * @property-write mixed $raw
 * @property-read \App\Models\User $user
 * @method static \Illuminate\Database\Eloquent\Builder|\App\Models\GroupUser newModelQuery()
 * @method static \Illuminate\Database\Eloquent\Builder|\App\Models\GroupUser newQuery()
 * @method static \Illuminate\Database\Eloquent\Builder|\App\Models\GroupUser query()
 * @method static \Illuminate\Database\Eloquent\Builder|\App\Models\GroupUser whereAddedBy($value)
 * @method static \Illuminate\Database\Eloquent\Builder|\App\Models\GroupUser whereCreatedAt($value)
 * @method static \Illuminate\Database\Eloquent\Builder|\App\Models\GroupUser whereGroupId($value)
 * @method static \Illuminate\Database\Eloquent\Builder|\App\Models\GroupUser whereId($value)
 * @method static \Illuminate\Database\Eloquent\Builder|\App\Models\GroupUser whereRole($value)
 * @method static \Illuminate\Database\Eloquent\Builder|\App\Models\GroupUser whereUpdatedAt($value)
 * @method static \Illuminate\Database\Eloquent\Builder|\App\Models\GroupUser whereUserId($value)
 * @mixin \Eloquent
 * @property int|null $removed_by
 * @property \Illuminate\Support\Carbon|null $deleted_at
 * @method static bool|null forceDelete()
 * @method static \Illuminate\Database\Query\Builder|\App\Models\GroupUser onlyTrashed()
 * @method static bool|null restore()
 * @method static \Illuminate\Database\Eloquent\Builder|\App\Models\GroupUser whereDeletedAt($value)
 * @method static \Illuminate\Database\Eloquent\Builder|\App\Models\GroupUser whereRemovedBy($value)
 * @method static \Illuminate\Database\Query\Builder|\App\Models\GroupUser withTrashed()
 * @method static \Illuminate\Database\Query\Builder|\App\Models\GroupUser withoutTrashed()
 */
class GroupUser extends Model
{
    use SoftDeletes;
    
    public $table = 'group_users';

    const ROLE_MEMBER = 1;
    const ROLE_ADMIN = 2;

    /**
     * The attributes that are mass assignable.
     *
     * @var array
     */
    protected $fillable = [
        'group_id', 'user_id', 'added_by', 'role', 'removed_by', 'deleted_at'
    ];

    /**
     * The attributes that should be cast to native types.
     *
     * @var array
     */
    protected $casts = [
        'id'         => 'integer',
        'group_id'   => 'integer',
        'user_id'    => 'integer',
        'added_by'   => 'integer',
        'removed_by'   => 'integer',
        'role'       => 'integer',
        'created_at' => 'datetime',
        'updated_at' => 'datetime',
        'deleted_at' => 'datetime',
    ];

    /**
     * Validation rules
     *
     * @var array
     */
    public static $rules = [
        'group_id'   => 'required|integer',
        'user_id'    => 'required|integer',
        'is_removed' => 'nullable|integer',
    ];

    /**
     * @return \Illuminate\Database\Eloquent\Relations\HasOne
     */
    public function user()
    {
        return $this->hasOne(User::class, 'id', 'user_id');
    }
}
