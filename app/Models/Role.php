<?php

namespace App\Models;

use Eloquent as Model;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Relations\MorphToMany;
use Illuminate\Support\Carbon;

/**
 * Class Role
 *
 * @package App\Models
 * @version November 12, 2019, 11:13 am UTC
 * @property int $id
 * @property string $name
 * @property string $guard_name
 * @property Carbon|null $created_at
 * @property Carbon|null $updated_at
 * @method static Builder|Role newModelQuery()
 * @method static Builder|Role newQuery()
 * @method static Builder|Role query()
 * @method static Builder|Role whereCreatedAt($value)
 * @method static Builder|Role whereGuardName($value)
 * @method static Builder|Role whereId($value)
 * @method static Builder|Role whereName($value)
 * @method static Builder|Role whereUpdatedAt($value)
 * @mixin Model
 * @property int $is_default
 * @method static Builder|Role whereIsDefault($value)
 * @property-write mixed $raw
 */
class Role extends Model
{
    public $table = 'roles';

    protected $dates = ['deleted_at'];

    public $fillable = [
        'name',
        'guard_name',
        'is_default'
    ];

    const ADMIN_ROLE = 1;
    const MEMBER_ROLE = 2;

    const MEMBER_ROLE_NAME = 'Member';
    const ADMIN_ROLE_NAME = 'Admin';

    /**
     * The attributes that should be casted to native types.
     *
     * @var array
     */
    protected $casts = [
        'id' => 'integer'
    ];

    /**
     * Validation rules
     *
     * @var array
     */
    public static $rules = [
        'name' => 'required',
    ];

    /**
     * @return MorphToMany
     */
    public function users()
    {
        return $this->morphedByMany(User::class, 'model', 'model_has_roles', 'role_id', 'model_id');
    }

}
