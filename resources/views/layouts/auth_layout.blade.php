<!DOCTYPE html>
<html>
<head>
    <base href="./">
    <meta charset="utf-8">
    <meta http-equiv="X-UA-Compatible" content="IE=edge">
    <meta name="viewport" content="width=device-width, initial-scale=1.0, shrink-to-fit=no">
    <title>@yield('title') | {{getAppName()}}</title>
    <meta name="description" content="{{getAppName()}} @yield('meta_content')">
    <meta name="keyword" content="CoreUI,Bootstrap,Admin,Template,InfyOm,Open,Source,jQuery,CSS,HTML,RWD,Dashboard">
    <!-- Bootstrap-->
    <link rel="stylesheet" href="{{ mix('assets/css/bootstrap.min.css') }}">
    <!-- Theme style -->
    <link rel="stylesheet" href="{{ mix('assets/css/coreui.min.css') }}">
    <link rel="stylesheet" href="{{ mix('assets/css/font-awesome.css') }}">
    <link rel="stylesheet" href="{{ mix('assets/css/jquery.toast.min.css') }}">

    @yield('page_css')
    @yield('css')
</head>
<body class="app flex-row align-items-center">
@yield('content')

<!-- CoreUI and necessary plugins-->
<script src="{{ mix('assets/js/jquery.min.js') }}"></script>
<script src="{{ mix('assets/js/popper.min.js') }}"></script>
<script src="{{ mix('assets/js/bootstrap.min.js') }}"></script>
<script src="{{ mix('assets/js/coreui.min.js') }}"></script>
<script src="{{ mix('assets/js/perfect-scrollbar.min.js') }}"></script>
<script src="{{ mix('assets/js/jquery.toast.min.js') }}"></script>
<script src="{{ mix('assets/js/auth-forms.js') }}"></script>
<script src="{{ mix('assets/js/custom.js') }}"></script>

@yield('page_js')
@yield('scripts')
</body>

</html>
