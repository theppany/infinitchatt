<div id="edit_role_modal" class="modal fade" role="dialog" tabindex="-1">
    <div class="modal-dialog">

        <!-- Modal content-->
        <div class="modal-content">
            <div class="modal-header">
                <h4 class="modal-title">{{ __('messages.edit_role') }}</h4>
                <button type="button" class="close" data-dismiss="modal">&times;</button>
            </div>
            {!! Form::open(['id'=>'editRoleForm']) !!}
            {!! Form::hidden('role_id',null, ['id' => 'edit_role_id']) !!}
            <div class="modal-body">
                <div class="form-group col-sm-12">
                    <div class="alert alert-danger form-group col-sm-12" style="display: none" id="editValidationErrorsBox"></div>
                </div>
                <div class="form-group col-sm-12">
                    {!! Form::label('name', __('messages.name')) !!}<span class="red">*</span>
                    {!! Form::text('name', null, ['class' => 'form-control', 'id' => 'edit_role_name', 'required']) !!}
                </div>
                <div class="text-right form-group col-sm-12">
                    {!! Form::button(__('messages.save'), ['type'=>'submit','class' => 'btn btn-primary','id'=>'btnEditSave','data-loading-text'=>"<i class='fa fa-refresh fa-spin'></i> " .__('messages.processing')]) !!}
                    <button type="button" id="btnCancelEdit" class="btn btn-secondary close_edit_role ml-1"
                            data-dismiss="modal">{{ __('messages.cancel') }}
                    </button>
                </div>
            </div>
            {!! Form::close() !!}
        </div>

    </div>
</div>
