$(document).ready(function () {
    let roleTable = $('#roles-table').DataTable({
        processing: true,
        serverSide: true,
        'order': [[0, 'asc']],
        ajax: {
            url: roleUrl,
        },
        columnDefs: [
            {
                'targets': [1],
                'orderable': false,
                'className': 'text-center',
                'width': '7%',
            },
        ],
        columns: [
            {
                data: 'name',
                name: 'name',
            },
            {
                data: function (row) {
                    if (row.is_default) {
                        return '';
                    }
                    return '<button title="Edit" class="index__btn btn btn-ghost-success btn-sm edit-btn" data-id="' +
                        row.id + '">' +
                        '<i class="cui-pencil action-icon"></i>' +
                        '</button>' +
                        '<button title="Delete" class="index__btn btn btn-ghost-danger btn-sm delete-btn" data-id="' +
                        row.id + '">' +
                        '<i class="cui-trash action-icon"></i></button>';
                }, name: 'id',
            },
        ],
    });

    $(document).on('click', '.edit-btn', function () {
        let id = $(this).data('id');
        $.ajax({
            type: 'get',
            url: roleUrl + id + '/edit',
            success: function (data) {
                if (data.success) {
                    $('#edit_role_name').
                        val(htmlSpecialCharsDecode(data.data.name));
                    $('#edit_role_id').val(data.data.id);
                    $('#edit_role_modal').modal('show');
                }
            },
            error: function (error) {
                displayToastr('Error', 'error', result.responseJSON.message);
            },
        });
    });

    $('#createRoleForm').on('submit', function (event) {
        event.preventDefault();
        let loadingButton = jQuery(this).find('#btnCreateRole');
        loadingButton.button('loading');
        $.ajax({
            url: createRoleUrl,
            type: 'post',
            data: new FormData($(this)[0]),
            processData: false,
            contentType: false,
            success: function (result) {
                if (result.success) {
                    displayToastr('Success', 'success', result.message);
                    $('#create_role_modal').modal('hide');
                    roleTable.ajax.reload(null, false);
                }
            },
            error: function (result) {
                displayToastr('Error', 'error', result.responseJSON.message);
            },
            complete: function () {
                loadingButton.button('reset');
            },
        });
    });

    $('#editRoleForm').on('submit', function (event) {
        event.preventDefault();
        let loadingButton = jQuery(this).find('#btnEditSave');
        loadingButton.button('loading');
        let id = $('#edit_role_id').val();
        $.ajax({
            url: roleUrl + id + '/update',
            type: 'post',
            data: new FormData($(this)[0]),
            processData: false,
            contentType: false,
            success: function (result) {
                if (result.success) {
                    $('#edit_role_modal').modal('hide');
                    roleTable.ajax.reload(null, false);
                }
            },
            error: function (result) {
                printErrorMessage('#editValidationErrorsBox',
                    result.responseJSON.message);
                console.log(result.responseJSON.message);
            },
            complete: function () {
                loadingButton.button('reset');
            },
        });
    });

    $('#create_role_modal').on('hidden.bs.modal', function () {
        resetModalForm('#createRoleForm', '#validationErrorsBox');
    });
    $('#edit_role_modal').on('hidden.bs.modal', function () {
        resetModalForm('#editRoleForm', '#editValidationErrorsBox');
    });

    function resetModalForm (formId, validationBox) {
        $(formId)[0].reset();
        $(validationBox).hide();
    }

    function printErrorMessage (selector, errorMessage) {
        $(selector).show().html('');
        $(selector).append('<div>' + errorMessage + '</div>');
    }

    const swalDelete = Swal.mixin({
        customClass: {
            confirmButton: 'btn btn-danger mr-2 btn-lg',
            cancelButton: 'btn btn-secondary btn-lg',
        },
        buttonsStyling: false,
    });

// open delete confirmation model
    $(document).on('click', '.delete-btn', function (event) {
        let roleId = $(this).data('id');
        swalDelete.fire({
            title: 'Are you sure?',
            html: 'Are you sure you want to delete this role ?',
            icon: 'warning',
            showCancelButton: true,
            confirmButtonText: 'Delete',
        }).then((result) => {
            if (result.value) {
                $.ajax({
                    url: roleUrl + roleId,
                    type: 'DELETE',
                    dataType: 'json',
                    success: function (obj) {
                        displayToastr(
                            'Success', 'success', 'Role deleted successfully.',
                        );
                        roleTable.ajax.reload(null, false);
                    },
                    error: function (data) {
                        displayToastr('Error', 'error',
                            data.responseJSON.message);
                    },
                });
            }
        });
    });
});