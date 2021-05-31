@extends('layouts.app')
@section('title')
    {{ __('messages.settings') }}
@endsection
@section('page_css')
@endsection
@section('css')
    <link rel="stylesheet" href="{{ mix('assets/css/admin_panel.css') }}">
@endsection
@section('content')
    <div class="container-fluid page__container">
        <div class="animated fadeIn">
            @include('flash::message')
            <div class="row">
                <div class="col-lg-12">
                    <div class="card">
                        <div class="card-header">
                            <div class="pull-left page__heading">
                                {{ __('messages.settings') }}
                            </div>
                        </div>
                        <div class="card-body">
                            @include('coreui-templates::common.errors')
                            <form method="post" enctype="multipart/form-data" action="{{ route('settings.update') }}">
                                {{ csrf_field() }}
                                <div class="form-group row col-sm-12">
                                    <div class="col-sm-6">
                                        <!-- App Name Field -->
                                        <div class="form-group col-sm-12">
                                            {!! Form::label('app_name', __('messages.app_name') ) !!}<span class="red">*</span>
                                            {!! Form::text('app_name', $settings['app_name'] ?? '', ['class' => 'form-control', 'required']) !!}
                                        </div>
                                        <!-- Company Name Field -->
                                        <div class="form-group col-sm-12">
                                            {!! Form::label('company_name', __('messages.company_name') ) !!}<span class="red">*</span>
                                            {!! Form::text('company_name', $settings['company_name'] ?? '', ['class' => 'form-control', 'required']) !!}
                                        </div>
                                    </div>
                                    <div class="col-sm-6 col-md-3">
                                        <div class="form-group mt-2">
                                            <div class="profile__logo-img-wrapper">
                                                <img src="{{ $settings['logo_url'] ?? asset('assets/images/logo.png') }}"
                                                     alt="" id="logo-img">
                                            </div>
                                            <div class="mt-2 user__upload-btn">
                                                <label class="btn profile__update-label">
                                                    {{ __('messages.upload_logo') }}
                                                    <input id="logo_upload" class="d-none" name="app_logo" type="file">
                                                </label>
                                            </div>
                                        </div>
                                    </div>
                                    <div class="col-sm-6 col-md-3">
                                        <div class="form-group mt-2">
                                            <div class="profile__favicon-img-wrapper">
                                                <img src="{{ $settings['favicon_url'] ?? asset('assets/images/logo-30x30.png') }}"
                                                     alt="" id="favicon-img">
                                            </div>
                                            <div class="mt-2 user__upload-btn">
                                                <label class="btn profile__update-label">
                                                    {{ __('messages.upload_favicon') }}
                                                    <input id="favicon_upload" class="d-none" name="favicon_logo"
                                                           type="file">
                                                </label>
                                            </div>
                                        </div>
                                    </div>
                                    <div class="col-sm-6">
                                        <!-- Is Active Field -->
                                        <div class="form-group col-sm-12">
                                            <div class=""><label>{{ __('messages.enable_group_chat') }}</label></div>
                                            <label class="switch switch-label switch-outline-primary-alt">
                                                <input name="enable_group_chat" class="switch-input enable_group_chat"
                                                       type="checkbox" value="1" {{$enabledGroupChat}}>
                                                <span class="switch-slider" data-checked="&#x2713;"
                                                      data-unchecked="&#x2715;"></span>
                                            </label>
                                        </div>
                                    </div>
                                </div>
                                <div class="form-group col-sm-12">
                                    <button type="reset"
                                            class="btn btn-secondary pull-right">{{ __('messages.cancel') }}</button>
                                    <button type="submit"
                                            class="btn btn-primary pull-right mr-1">{{ __('messages.save') }}</button>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>
@endsection
@section('page_js')
@endsection
@section('scripts')
    <script>
    </script>
    <script src="{{ mix('assets/js/admin/users/edit_user.js') }}"></script>
@endsection
