$('#upload-photo').on('change', function () {
    readURL(this, 'upload-photo-img');
});

// profile js
function readURL (input, photoId) {
    if (input.files && input.files[0]) {
        let reader = new FileReader();

        reader.onload = function (e) {
            $('#' + photoId).attr('src', e.target.result);
        };

        reader.readAsDataURL(input.files[0]);
    }
}

$('#edit_upload-photo').on('change', function () {
    readURL(this, 'edit_upload-photo-img');
});

$('#logo_upload').on('change', function () {
    readURL(this, 'logo-img');
});

$('#favicon_upload').on('change', function () {
    readURL(this, 'favicon-img');
});
