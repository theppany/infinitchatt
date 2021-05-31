<?php

namespace App\Repositories;

use App\Exceptions\ApiOperationFailedException;
use App\Models\Setting;
use App\Traits\ImageTrait;
use Arr;
use Exception;
use Illuminate\Support\Collection;
use Symfony\Component\HttpKernel\Exception\UnprocessableEntityHttpException;
use Image;
use Storage;

/**
 * Class SettingsRepository.
 */
class SettingsRepository
{
    /**
     * @var array
     */
    protected $fieldSearchable = ['key', 'value'];

    /**
     * Return searchable fields
     *
     * @return array
     */
    public function getFieldsSearchable()
    {
        return $this->fieldSearchable;
    }

    /**
     * Configure the Model
     **/
    public function model()
    {
        return Setting::class;
    }

    /**
     * @param array $input
     *
     * @throws ApiOperationFailedException
     * @throws Exception
     */
    public function updateSettings($input)
    {
        if (isset($input['app_logo']) && ! empty($input['app_logo'])) {
            $this->deleteImageValue('logo_url');
            $input['logo_url'] = $this->uploadLogo($input['app_logo']);
        }
        if (isset($input['favicon_logo']) && ! empty($input['favicon_logo'])) {
            $input['favicon_url'] = $this->uploadFavicon($input['favicon_logo']);
        }
        $input = Arr::only($input, ['app_name', 'company_name', 'logo_url', 'favicon_url', 'enable_group_chat']);
        $input['enable_group_chat'] = (isset($input['enable_group_chat'])) ? 1 : 0;

        foreach ($input as $key => $value) {
            $setting = Setting::firstOrCreate(['key' => $key]);
            $setting->update(['value' => $value]);
        }
    }

    /**
     * @return Collection
     */
    public function getSettings()
    {
        $settings = Setting::all()->pluck('value', 'key');
        if (isset($settings['logo_url'])) {
            $settings['logo_url'] = app(Setting::class)->getLogoUrl($settings['logo_url']);
        }

        return $settings;
    }

    /**
     * @param $file
     *
     * @throws ApiOperationFailedException
     *
     * @return string
     */
    public function uploadLogo($file)
    {
        $extension = strtolower($file->getClientOriginalExtension());
        if (in_array($extension, ['jpg', 'png', 'jpeg'])) {
            $fileName = ImageTrait::makeImage($file, Setting::PATH, ['width' => 65, 'height' => 35]);
            ImageTrait::makeImage($file, Setting::THUMB_PATH,
                ['width' => 30, 'height' => 30, 'file_name' => $fileName]);

            return $fileName;
        } else {
            throw new UnprocessableEntityHttpException("Please upload valid 'jpg', 'png' or 'jpeg' image.");
        }
    }

    /**
     * @param $file
     *
     * @throws Exception
     *
     * @return string
     */
    public function uploadFavicon($file)
    {
        $extension = strtolower($file->getClientOriginalExtension());
        if (in_array($extension, ['jpg', 'png', 'jpeg'])) {
            $this->deleteFavicon();
            $fileName = 'favicon.ico';
            $imageThumb = Image::make($file->getRealPath())->fit(15, 15);
            $imageThumb = $imageThumb->stream();

            Storage::disk('public_uploads')->put($fileName, $imageThumb->__toString());

            return $fileName;
        } else {
            throw new UnprocessableEntityHttpException("Please upload valid 'jpg', 'png' or 'jpeg' image.");
        }
    }

    /**
     * @param $keyName
     *
     * @throws Exception
     */
    public function deleteImageValue($keyName)
    {
        $setting = Setting::where(['key' => $keyName])->first();
        if (! empty($setting) && ! empty($setting->value)) {
            $oldImage = $setting->value;
            $setting->update(['value' => '']);
            $this->deleteImage($oldImage);
        }
    }

    /**
     * @param string $fileName
     *
     * @throws Exception
     *
     * @return bool
     */
    public function deleteImage($fileName)
    {
        if (empty($fileName)) {
            return true;
        }

        ImageTrait::deleteImage(Setting::THUMB_PATH.DIRECTORY_SEPARATOR.$fileName);

        return ImageTrait::deleteImage(Setting::PATH.DIRECTORY_SEPARATOR.$fileName);
    }

    /**
     * @throws Exception
     */
    public function deleteFavicon()
    {
        $setting = Setting::where(['key' => 'favicon_logo'])->first();
        if (! empty($setting) && ! empty($setting->value)) {
            $oldImage = $setting->value;
            $setting->update(['value' => '']);
            if (Storage::disk('public_uploads')->exists($oldImage)) {
                Storage::disk('public_uploads')->delete($oldImage);

                return true;
            }
        }
    }
}
