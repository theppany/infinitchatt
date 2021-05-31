@extends('layouts.app')
@section('title')
    {{ __('messages.edit_profile') }}
@endsection
@section('content')
    <div class="page-container">
        <div class="profile bg-white">
            <h1>{{ __('messages.edit_profile') }}</h1>
            {!! Form::open(['id'=>'editProfileForm','files'=>true]) !!}
            <div class="profile__inner m-auto">
                <div class="profile__img-wrapper">
                    <img src="{{ Auth::user()->photo_url }}" alt="" id="upload-photo-img">
                </div>
                <div class="text-center mt-2">
                    <label class="btn profile__update-label">{{ __('messages.upload_photo') }}
                        <input id="upload-photo" class="d-none" name="photo" type="file">
                    </label>
                    @if(!empty(Auth::user()->getOriginal('photo_url')))
                    <label>
                         <button class="btn btn-danger mb-2 remove-profile-img" >Remove Profile</button>
                    </label>
                    @endif
                </div>
                <div class="alert alert-danger w-100" style="display: none" id="editProfileValidationErrorsBox"></div>
                <div class="form-group bordered-input w-100">
                    <label for="user-name" class="mb-0">{{ __('messages.name') }}<span
                                class="profile__required">*</span></label>
                    <input type="text" class="profile__name form-control pl-0" id="user-name"
                           aria-describedby="User name" placeholder="{{ __('messages.name') }}"
                           value="{{ (htmlspecialchars_decode(Auth::user()->name))??'' }}" name="name" required>
                </div>
                <div class="form-group bordered-input w-100">
                    <label for="email" class="mb-0">{{ __('messages.email') }}<span
                                class="profile__required">*</span></label>
                    <input type="email" class="profile__email form-control pl-0" id="email"
                           aria-describedby="User email" placeholder="{{ __('messages.email') }}"
                           value="{{Auth::user()->email}}" name="email" required>
                </div>
                <div class="form-group bordered-input w-100">
                    <label for="about">{{ __('messages.bio') }}</label> <textarea
                            class="profile__about form-control pl-0" id="about" rows="3"
                            name="about">{{ (htmlspecialchars_decode(Auth::user()->about))??'' }}</textarea>
                </div>
                <div class="form-group bordered-input w-100">
                    <label for="phone" class="mb-0">{{ __('messages.phone') }}</label> <input type="tel"
                                                                                              class="profile__phone form-control pl-0"
                                                                                              id="phone"
                                                                                              aria-describedby="User phone no"
                                                                                              placeholder="{{ __('messages.phone_number') }}"
                                                                                              name="phone"
                                                                                              value="{{Auth::user()->phone}}">
                </div>
                @php
                    $isSubscribed = Auth::user()->is_subscribed
                @endphp
                <div class="form-group w-100">
                    <div class="form-group w-50 float-left">
                        <label>{{ __('messages.group.privacy') }}</label>
                        <div class="custom-control custom-radio">
                            <input type="radio" class="custom-control-input" id="privacyPrivate" name="privacy" value="0"
                                   @if(Auth::user()->privacy == 0) checked @endif> <label class="custom-control-label"
                                                                                          for="privacyPrivate">
                                {{ __('messages.group.private') }}
                                <i class="fa fa-question-circle ml-2 question-type-open cursor-pointer"
                                   data-toggle="tooltip" data-placement="top" title="Only My Contacts can chat with me"
                                   data-original-title="Only My Contacts can chat with me"></i>
                            </label>
                        </div>
                        <div class="custom-control custom-radio">
                            <input type="radio" class="custom-control-input" id="privacyPublic" name="privacy" value="1"
                                   @if(Auth::user()->privacy == 1) checked @endif> <label class="custom-control-label"
                                                                                          for="privacyPublic">
                                {{ __('messages.group.public') }}
                                <i class="fa fa-question-circle ml-2 question-type-open cursor-pointer"
                                   data-toggle="tooltip" data-placement="top" title="Anyone can chat with me"
                                   data-original-title="Anyone can chat with me"></i>
                            </label>
                        </div>
                    </div>
                    <div class="form-group w-50 float-right">
                        <label>{{ __('messages.gender') }}</label>
                        <div class="custom-control custom-radio">
                            <input type="radio" class="custom-control-input" id="male" name="gender"
                                   value="{{ \App\Models\User::MALE }}"
                                   @if(Auth::user()->gender == \App\Models\User::MALE) checked @endif>
                            <label class="custom-control-label" for="male">{{ __('messages.male') }}</label>
                        </div>
                        <div class="custom-control custom-radio">
                            <input type="radio" class="custom-control-input" id="female" name="gender"
                                   value="{{ \App\Models\User::FEMALE }}"
                                   @if(Auth::user()->gender == \App\Models\User::FEMALE) checked @endif>
                            <label class="custom-control-label" for="female">{{ __('messages.female') }}</label>
                        </div>
                    </div>
                </div>
                <div class="form-group bordered-input w-100">
                    <div class="form-group pl-0  d-flex">
                        {!! Form::checkbox('is_subscribed',$isSubscribed,$isSubscribed, ['id' => 'webNotification']) !!}
                        &nbsp;<lable for="is_subscribed" class="mb-0">Enable Web Notification</lable>
                    </div>
                </div>
                <div class="d-flex w-100">
                    {!! Form::button(__('messages.save') , ['type'=>'submit','class' => 'btn btn-primary mr-2 ml-auto','id'=>'btnEditSave','data-loading-text'=>"<span class='spinner-border spinner-border-sm'></span> " .__('messages.processing')]) !!}
                    <a class="btn btn-secondary" id="cancelGroupModal"
                       href="{{url('conversations')}}">{{ __('messages.cancel') }}</a>
                </div>
            </div>
            {!! Form::close() !!}
        </div>
    </div>
@endsection
@section('scripts')
    <!--custom js-->
    <script>
        let profileURL = '{{ route('update.profile') }}';
        let removeProfileImage ='{{ url('remove-profile-image') }}';
    </script>
    <script src="{{ mix('assets/js/profile.js') }}"></script>
@endsection
