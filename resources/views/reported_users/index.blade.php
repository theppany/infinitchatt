@extends('layouts.app')
@section('title')
    {{ __('messages.reported_user') }}
@endsection
@section('page_css')
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
                                 {{ __('messages.reported_user') }}
                             </div>
                         </div>
                         <div class="card-body">
                             @include('reported_users.table')
                         </div>
                     </div>
                  </div>
             </div>
            @include('reported_users.show')
            @include('reported_users.templates.template')
         </div>
    </div>
@endsection
@section('page_js')
    <script type="text/javascript" src="{{ asset('js/dataTable.min.js') }}"></script>
@endsection
@section('scripts')
    <script>
        let reportedUsersUrl = "{{ route('reported-users.index') }}";
        let usersUrl = "{{ url('users') }}";
        let defaultImageAvatar = "{{ getDefaultAvatar() }}/";
    </script>
    <script src="{{ mix('assets/js/admin/reported_users/reported_users.js') }}"></script>
    <script type="text/javascript" src="{{ asset('assets/js/custom-datatables.js') }}"></script>
@endsection
