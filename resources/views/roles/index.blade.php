@extends('layouts.app')
@section('title')
    Roles
@endsection

@section('page_css')
    <link rel="stylesheet" href="{{ mix('assets/css/jquery.toast.min.css') }}">
    <link rel="stylesheet" type="text/css" href="{{ asset('css/dataTable.min.css') }}"/>
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
                                {{ __('messages.roles') }}
                            </div>
                            <button type="button" class="pull-right btn btn-primary" data-toggle="modal"
                                    data-target="#create_role_modal">{{ __('messages.new_role') }}</button>
                        </div>
                        <div class="card-body">
                            @include('roles.table')
                            <div class="pull-right mr-3">

                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>
    @include('roles.create')
    @include('roles.edit')
@endsection
@section('page_js')
    <script type="text/javascript" src="{{ asset('js/dataTable.min.js') }}"></script>
    <script src="{{ mix('assets/js/jquery.toast.min.js') }}"></script>
@endsection
@section('scripts')
    <script type="text/javascript" src="{{ asset('assets/js/custom-datatables.js') }}"></script>
    <script>
        let createRoleUrl = '{{ route('roles.store') }}';
        let roleUrl = '{{ url('roles') }}/';
        let token = '{{ csrf_token() }}';
    </script>
    <script src="{{ mix('assets/js/admin/roles/role.js') }}"></script>
    <script src="{{ mix('assets/js/custom.js') }}"></script>
@endsection

