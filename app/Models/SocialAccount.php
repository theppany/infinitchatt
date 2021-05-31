<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

/**
 * Class SocialAccount
 *
 * @property int $id
 * @property int $user_id
 * @property string $provider
 * @property string $provider_id
 * @property \Illuminate\Support\Carbon|null $created_at
 * @property \Illuminate\Support\Carbon|null $updated_at
 * @method static \Illuminate\Database\Eloquent\Builder|\App\Models\SocialAccount newModelQuery()
 * @method static \Illuminate\Database\Eloquent\Builder|\App\Models\SocialAccount newQuery()
 * @method static \Illuminate\Database\Eloquent\Builder|\App\Models\SocialAccount query()
 * @method static \Illuminate\Database\Eloquent\Builder|\App\Models\SocialAccount whereCreatedAt($value)
 * @method static \Illuminate\Database\Eloquent\Builder|\App\Models\SocialAccount whereId($value)
 * @method static \Illuminate\Database\Eloquent\Builder|\App\Models\SocialAccount whereProvider($value)
 * @method static \Illuminate\Database\Eloquent\Builder|\App\Models\SocialAccount whereProviderId($value)
 * @method static \Illuminate\Database\Eloquent\Builder|\App\Models\SocialAccount whereUpdatedAt($value)
 * @method static \Illuminate\Database\Eloquent\Builder|\App\Models\SocialAccount whereUserId($value)
 * @mixin \Eloquent
 * @property-write mixed $raw
 */
class SocialAccount extends Model
{
    const GOOGLE_PROVIDER = 'google';
    const FACEBOOK_PROVIDER = 'facebook';
    const TWITTER_PROVIDER = 'twitter';
    const YOUTUBE_PROVIDER = 'youtube';

    const SOCIAL_PROVIDERS = [
        self::GOOGLE_PROVIDER,
        self::FACEBOOK_PROVIDER,
        self::TWITTER_PROVIDER,
        self::YOUTUBE_PROVIDER,
    ];

    protected $table = 'social_accounts';

    protected $fillable = [
        'provider',
        'identifier',
        'device_id',
        'token',
        'token_secret',
    ];

    public static function facebookFields()
    {
        return [
            'first_name',
            'email',
            'gender',
            'id',
            'last_name',
            'name',
            'location',
            'verified',
            'birthday',
            'link',
            'locale',
        ];
    }

}
