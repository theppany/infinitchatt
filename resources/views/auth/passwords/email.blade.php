@extends('layouts.auth_layout')
@section('title')
    {{ __('messages.forget_password') }}
@endsection
@section('meta_content')
- {{ __('messages.request_for_password_reset_link') }}
@endsection
@section('page_css')
    <link rel="stylesheet" href="{{ mix('assets/css/simple-line-icons.css')}}">
@endsection
@section('content')
    <div class="container">
        <div class="row justify-content-center">
            <div class="col-md-6">
                <div class="card mx-4">
                    <div class="card-body p-4">
                        @include('flash::message')
                        <form method="post" action="{{ url('/password/email') }}" id="forgetPasswordForm">
                            {{ csrf_field() }}
                            <h1>{{ __('messages.forgot_your_password') }}</h1>
                            <p class="text-muted">{{ __('messages.enter_email_to_reset_password') }}</p>
                            <div class="input-group mb-3">
                                <div class="input-group-prepend">
                                    <span class="input-group-text">
                                      <i class="fa fa-btn fa-envelope"></i>
                                    </span>
                                </div>
                                <input type="email" class="form-control {{ $errors->has('email')?'is-invalid':'' }}"
                                       name="email" value="{{ old('email') }}" id="email"
                                       placeholder="{{ __('messages.email') }}" required>
                                @if ($errors->has('email'))
                                    <span class="invalid-feedback">
                                    <strong>{{ $errors->first('email') }}</strong>
                                </span>
                                @endif
                            </div>
                            <button type="button" id="forgetPasswordBtn" class="btn btn-primary float-right">
                                <i class="fa fa-btn fa-envelope mr-2"></i> {{ __('messages.reset_password') }}
                            </button>
                        </form>
                    </div>
                </div>
            </div>
        </div>
    </div>
@endsection
