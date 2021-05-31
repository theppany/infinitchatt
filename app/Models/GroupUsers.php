<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

/**
 * App\Models\GroupUsers
 *
 * @property int $id
 * @property int $group_id
 * @property int $user_id
 * @property int $is_removed
 * @property \Illuminate\Support\Carbon|null $created_at
 * @property \Illuminate\Support\Carbon|null $updated_at
 * @property-read \App\Models\User $user
 * @method static \Illuminate\Database\Eloquent\Builder|\App\Models\GroupUsers newModelQuery()
 * @method static \Illuminate\Database\Eloquent\Builder|\App\Models\GroupUsers newQuery()
 * @method static \Illuminate\Database\Eloquent\Builder|\App\Models\GroupUsers query()
 * @method static \Illuminate\Database\Eloquent\Builder|\App\Models\GroupUsers whereCreatedAt($value)
 * @method static \Illuminate\Database\Eloquent\Builder|\App\Models\GroupUsers whereGroupId($value)
 * @method static \Illuminate\Database\Eloquent\Builder|\App\Models\GroupUsers whereId($value)
 * @method static \Illuminate\Database\Eloquent\Builder|\App\Models\GroupUsers whereIsRemoved($value)
 * @method static \Illuminate\Database\Eloquent\Builder|\App\Models\GroupUsers whereUpdatedAt($value)
 * @method static \Illuminate\Database\Eloquent\Builder|\App\Models\GroupUsers whereUserId($value)
 * @mixin \Eloquent
 * @property int $role
 * @property int $added_by
 * @property int|null $removed_by
 * @property string|null $deleted_at
 * @property-write mixed $raw
 * @method static \Illuminate\Database\Eloquent\Builder|\App\Models\GroupUsers whereAddedBy($value)
 * @method static \Illuminate\Database\Eloquent\Builder|\App\Models\GroupUsers whereDeletedAt($value)
 * @method static \Illuminate\Database\Eloquent\Builder|\App\Models\GroupUsers whereRemovedBy($value)
 * @method static \Illuminate\Database\Eloquent\Builder|\App\Models\GroupUsers whereRole($value)
 */
class GroupUsers extends Model
{
    public $table = 'group_users';

    /**
     * The attributes that are mass assignable.
     *
     * @var array
     */
    protected $fillable = [
        'group_id', 'user_id', 'is_removed',
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
        'is_removed' => 'integer',
        'created_at' => 'datetime',
        'updated_at' => 'datetime',
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
