<div id="create_role_modal" class="modal fade" role="dialog" tabindex="-1">
    <div class="modal-dialog">

        <!-- Modal content-->
        <div class="modal-content">
            <div class="modal-header">
                <h4 class="modal-title">{{ __('messages.new_role') }}</h4>
                <button type="button" class="close" data-dismiss="modal">&times;</button>
            </div>
            {!! Form::open(['id'=>'createRoleForm']) !!}
            <div class="modal-body">
                <div class="form-group col-sm-12">
                    <div class="alert alert-danger" style="display: none" id="validationErrorsBox"></div>
                </div>
                <div class="form-group col-sm-12">
                    {!! Form::label('name', __('messages.name')) !!}<span class="red">*</span>
                    {!! Form::text('name', null, ['class' => 'form-control', 'id' => 'role_name', 'required']) !!}
                </div>
                <div class="text-right form-group col-sm-12">
                    {!! Form::button(__('messages.save'), ['type'=>'submit','class' => 'btn btn-primary','id'=>'btnCreateRole','data-loading-text'=>"<i class='fa fa-refresh fa-spin'></i> " .__('messages.processing')]) !!}
                    <button type="button" id="btnRoleCancel" class="btn btn-secondary close_create_role ml-1"
                            data-dismiss="modal">{{ __('messages.cancel') }}
                    </button>
                </div>
            </div>
            {!! Form::close() !!}
        </div>
    </div>
</div>
