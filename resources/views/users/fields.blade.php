<div class="row col-sm-12">
    <div class="col-sm-12">
        <div class="alert alert-danger" style="display: none" id="validationErrorsBox"></div>
    </div>
    <div class="col-sm-6">
        <div class="row">
            <!-- Name Field -->
            <div class="form-group col-sm-6">
                {!! Form::label('name', __('messages.full_name') ) !!}<span class="red">*</span>
                {!! Form::text('name', null, ['class' => 'form-control', 'id' => 'name', 'required']) !!}
            </div>

            <!-- Phone Field -->
            <div class="form-group col-sm-6">
                {!! Form::label('phone', __('messages.phone') ) !!}
                {!! Form::text('phone', null, ['class' => 'form-control', 'id' => 'phone']) !!}
            </div>
        </div>

        <!-- Email Field -->
        <div class="form-group">
            {!! Form::label('email', __('messages.email') ) !!}<span class="red">*</span>
            {!! Form::email('email', null, ['class' => 'form-control', 'id' => 'email', 'required']) !!}
        </div>

        <div class="row">
            <div class="form-group col-sm-6">
                <label>{{ __('messages.gender') }}</label>
                <div class="custom-control custom-radio">
                    <input type="radio" class="custom-control-input" id="male" name="gender"
                            value="{{ \App\Models\User::MALE }}"> <label class="custom-control-label" for="male">
                        {{ __('messages.male') }}
                    </label>
                </div>
                <div class="custom-control custom-radio">
                    <input type="radio" class="custom-control-input" id="female" name="gender"
                           value="{{ \App\Models\User::FEMALE }}"> <label class="custom-control-label" for="female">
                        {{ __('messages.female') }}
                    </label>
                </div>
            </div>
            <div class="form-group col-sm-6">
                <label>{{ __('messages.group.privacy') }}</label>
                <div class="custom-control custom-radio">
                    <input type="radio" class="custom-control-input" id="privacyPrivate" name="privacy" value="0">
                    <label class="custom-control-label" for="privacyPrivate">
                        {{ __('messages.group.private') }}
                        <i class="fa fa-question-circle ml-2 question-type-open cursor-pointer" data-toggle="tooltip"
                           data-placement="top" title=""
                           data-original-title="All group members can send messages into the group."></i> </label>
                </div>
                <div class="custom-control custom-radio">
                    <input type="radio" class="custom-control-input" id="privacyPublic" name="privacy" value="1"> <label
                            class="custom-control-label" for="privacyPublic">
                        {{ __('messages.group.public') }}
                        <i class="fa fa-question-circle ml-2 question-type-open cursor-pointer" data-toggle="tooltip"
                           data-placement="top" title=""
                           data-original-title="All group members can send messages into the group."></i> </label>
                </div>
            </div>
        </div>

        <div class="row">
            <!-- Is Active Field -->
            <div class="form-group col-sm-6">
                {!! Form::label('is_active', __('messages.is_active') ) !!}<span class="red">*</span>
                {!! Form::select('is_active', [1 => 'Active', 0 => 'In Active'], (isset($user->is_active)) ? $user->is_active : [],  ['class' => 'form-control', 'id' => 'is_active',  'required']) !!}
            </div>

            <!-- Role Field -->
            <div class="form-group col-sm-6">
                {!! Form::label('role', __('messages.role') ) !!}<span class="red">*</span>
                {!! Form::select('role_id', $roles, (isset($user->role_id)) ? $user->role_id : [],  ['class' => 'form-control','placeholder' => 'Select Role', 'id' => 'role_id', 'required']) !!}
            </div>
        </div>

        <div class="row">
            <div class="form-group col-sm-6">
                {!! Form::label('password', __('messages.password') ) !!}<span class="red">*</span>
                <input type="password" name="password" class="form-control" onkeypress="return avoidSpace(event)"
                       required>
            </div>
            <div class="form-group col-sm-6">
                {!! Form::label('password', __('messages.confirm_password') ) !!}<span class="red">*</span>
                <input type="password" name="password_confirmation" class="form-control"
                       onkeypress="return avoidSpace(event)" required>
            </div>
        </div>
    </div>
    <div class="col-sm-6">
        <div class="form-group">
            <div class="profile__inner m-auto">
                <div class="text-center profile__img-wrapper">
                    <img src="{{ isset($user->photo_url) ? $user->photo_url : getDefaultAvatar() }}" alt=""
                         id="upload-photo-img">
                </div>
                <div class="text-center mt-2 user__upload-btn">
                    <label class="btn profile__update-label">
                        {{ __('messages.upload_photo') }}
                        <input id="upload-photo" class="d-none" name="photo" type="file">
                    </label>
                </div>
            </div>
        </div>

        <!-- Bio Field -->
        <div class="form-group">
            {!! Form::label('bio', __('messages.bio') ) !!}
            {!! Form::textarea('about', null, ['class' => 'form-control user__bio', 'rows' => 3, 'id' => 'about']) !!}
        </div>
    </div>

    <!-- Submit Field -->
    <div class="text-right form-group col-sm-12">
        {!! Form::submit(__('messages.save'), ['class' => 'btn btn-primary', 'id' => 'createBtnSave']) !!}
        <button type="button" class="btn btn-secondary ml-1" data-dismiss="modal">{{ __('messages.cancel') }}</button>
    </div>
</div>
