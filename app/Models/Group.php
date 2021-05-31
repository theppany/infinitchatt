<?php

namespace App\Models;

use App\Traits\ImageTrait;
use Illuminate\Database\Eloquent\Model;
use Str;


/**
 * App\Models\Group
 *
 * @property string $id
 * @property string $name
 * @property string|null $description
 * @property string $photo_url
 * @property int $privacy
 * @property int $group_type 1 => Open (Anyone can send message), 2 => Close (Only Admin can send message)
 * @property int $created_by
 * @property \Illuminate\Support\Carbon|null $created_at
 * @property \Illuminate\Support\Carbon|null $updated_at
 * @property-write mixed $raw
 * @property-read \Illuminate\Database\Eloquent\Collection|\App\Models\User[] $users
 * @property-read int|null $users_count
 * @method static \Illuminate\Database\Eloquent\Builder|\App\Models\Group newModelQuery()
 * @method static \Illuminate\Database\Eloquent\Builder|\App\Models\Group newQuery()
 * @method static \Illuminate\Database\Eloquent\Builder|\App\Models\Group query()
 * @method static \Illuminate\Database\Eloquent\Builder|\App\Models\Group whereCreatedAt($value)
 * @method static \Illuminate\Database\Eloquent\Builder|\App\Models\Group whereCreatedBy($value)
 * @method static \Illuminate\Database\Eloquent\Builder|\App\Models\Group whereDescription($value)
 * @method static \Illuminate\Database\Eloquent\Builder|\App\Models\Group whereGroupType($value)
 * @method static \Illuminate\Database\Eloquent\Builder|\App\Models\Group whereId($value)
 * @method static \Illuminate\Database\Eloquent\Builder|\App\Models\Group whereName($value)
 * @method static \Illuminate\Database\Eloquent\Builder|\App\Models\Group wherePhotoUrl($value)
 * @method static \Illuminate\Database\Eloquent\Builder|\App\Models\Group wherePrivacy($value)
 * @method static \Illuminate\Database\Eloquent\Builder|\App\Models\Group whereUpdatedAt($value)
 * @mixin \Eloquent
 * @property-read \App\Models\User $createdByUser
 * @property-read mixed $group_created_by
 * @property-read mixed $my_role
 * @property-read mixed $removed_from_group
 * @property-read \Illuminate\Database\Eloquent\Collection|\App\Models\LastConversation[] $lastConversations
 * @property-read int|null $last_conversations_count
 * @property-read \Illuminate\Database\Eloquent\Collection|\App\Models\User[] $usersWithTrashed
 * @property-read int|null $users_with_trashed_count
 */
class Group extends Model
{
    use ImageTrait {
        deleteImage as traitDeleteImage;
    }

    const TYPE_OPEN = 1;
    const TYPE_CLOSE = 2;
    const PRIVACY_PUBLIC = 1;
    const PRIVACY_PRIVATE = 2;
    const HEIGHT = 250;
    const WIDTH = 250;

    const GROUP_DETAILS_UPDATED = 1;
    const GROUP_MEMBER_ROLE_UPDATED = 2;
    const GROUP_MEMBER_REMOVED = 3;
    const GROUP_NEW_MEMBERS_ADDED = 4;
    const GROUP_DELETED_BY_OWNER = 5;
    const GROUP_MESSAGE_READ_BY_ALL_MEMBERS = 6;
    const NEW_GROUP_MESSAGE_ARRIVED = 7;
    const GROUP_MESSAGE_READ_BY_MEMBER = 8;

    /**
     * The attributes that are mass assignable.
     *
     * @var array
     */
    protected $fillable = [
        'name', 'description', 'photo_url', 'group_type', 'privacy', 'created_by',
    ];

    static $PATH = 'groups';


    protected $guarded = [];

    protected $appends = ['photo_url', 'my_role', 'removed_from_group'];

    protected static function boot()
    {
        parent::boot();

        static::creating(function ($post) {
            $post->{$post->getKeyName()} = (string) Str::uuid();
        });
    }

    public function getIncrementing()
    {
        return false;
    }

    public function getKeyType()
    {
        return 'string';
    }

    protected $with = ['users', 'usersWithTrashed'];

    /**
     * The attributes that should be cast to native types.
     *
     * @var array
     */
    protected $casts = [
        'id'          => 'string',
        'name'        => 'string',
        'description' => 'string',
        'photo_url'   => 'string',
        'group_type'  => 'integer',
        'privacy'     => 'integer',
        'created_at'  => 'datetime',
        'updated_at'  => 'datetime',
    ];

    /**
     * Validation rules
     *
     * @var array
     */
    public static $rules = [
        'name'        => 'required|string|max:100',
        'description' => 'nullable|string',
        'privacy'     => 'nullable|integer',
        'group_type'  => 'nullable|integer',
        'users'       => 'required|array',
    ];

    /**
     * @return \Illuminate\Database\Eloquent\Relations\BelongsToMany
     */
    public function users()
    {
        return $this->belongsToMany(User::class, 'group_users', 'group_id', 'user_id')->wherePivot('deleted_at', '=',
            null)->withPivot(['role', 'deleted_at', 'created_at'])->orderByDesc('role')->orderBy('users.name', 'asc');
    }

    /**
     * @return \Illuminate\Database\Eloquent\Relations\BelongsToMany
     */
    public function usersWithTrashed()
    {
        return $this->belongsToMany(User::class, 'group_users', 'group_id', 'user_id')->withPivot([
            'role', 'deleted_at',
        ]);
    }

    public function getMyRoleAttribute()
    {
        $groupUsers = $this->users->keyBy('id');
        $myRole = isset($groupUsers[getLoggedInUserId()]) ? $groupUsers[getLoggedInUserId()]->pivot->role : null;

        return $myRole;
    }

    public function getRemovedFromGroupAttribute()
    {
        $groupUsers = $this->usersWithTrashed->keyBy('id');
        $isRemovedFromGroup = (isset($groupUsers[getLoggedInUserId()]) && ! empty($groupUsers[getLoggedInUserId()]->pivot->deleted_at)) ? true : false;


        return $isRemovedFromGroup;
    }

    /**
     * @param $value
     *
     * @return string
     */
    public function getPhotoUrlAttribute($value)
    {
        if (! empty($this->getOriginal('photo_url'))) {
            return $this->imageUrl(self::$PATH.DIRECTORY_SEPARATOR.$this->getOriginal('photo_url'));
        }

        return asset('assets/images/group-img.png');
    }

    /**
     * @return bool
     */
    public function deleteImage()
    {
        $image = $this->getOriginal('photo_url');
        if (empty($image)) {
            return true;
        }

        return $this->traitDeleteImage(self::$PATH.DIRECTORY_SEPARATOR.$image);
    }

    /**
     * @return \Illuminate\Database\Eloquent\Relations\BelongsTo
     */
    public function createdByUser()
    {
        return $this->belongsTo(User::class, 'created_by');
    }

    /**
     * @return string
     */
    public function getGroupCreatedByAttribute()
    {
        return $this->createdByUser->name;
    }

    /**
     * @return \Illuminate\Database\Eloquent\Relations\HasMany
     */
    public function lastConversations()
    {
        return $this->hasMany(LastConversation::class, 'group_id', 'id');
    }
}
