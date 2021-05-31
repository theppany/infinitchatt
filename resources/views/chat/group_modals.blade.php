<div id="createNewGroup" class="modal fade" role="dialog" tabindex="-1">
    <div class="modal-dialog modal-lg">
        <!-- Modal content-->
        <div class="modal-content">
            <div class="modal-header">
                <h4 class="modal-title group-modal-title">{{ __('messages.group.create_group') }}</h4>
                <button type="button" class="close" data-dismiss="modal">&times;</button>
            </div>
            {!! Form::open(['id'=>'createGroupForm']) !!}
            @csrf
            <div class="modal-body">
                <div class="form-group col-sm-12">
                    <div class="alert alert-danger" style="display: none" id="groupValidationErrorsBox"></div>
                </div>
                <input type="hidden" name="id" value="" id="groupId">
                <div class="row">
                    <div class="col-sm-6">
                        {!! Form::label('name', __('messages.group.name')) !!}<span class="red">*</span>
                        {!! Form::text('name', null, ['class' => 'form-control', 'required', 'id' => 'groupName']) !!}
                    </div>
                    <div class="col-sm-6 d-flex">
                        <div class="col-sm-6 pl-0">
                            {!! Form::label('photo', 'Group Icon') !!}
                            <label class="edit-profile__file-upload"> Choose your file
                                {!! Form::file('photo',['id'=>'groupImage','class' => 'd-none']) !!}
                            </label>
                        </div>
                        <div class="mt-2 profile__inner m-auto">
                            <div class=" preview-image-video-container text-center chat-profile__img-wrapper mt-0">
                                <img id='groupPhotoPreview' class=""
                                     src="{{asset('assets/images/group-img.png')}}"/>
                            </div>
                        </div>
                    </div>
                </div>
                <div class="row">
                    <div class="col-6">
                        <div class="div-group-type d-flex">
                            <div class="col-sm-3 px-0">
                                {!! Form::label('type', __('messages.group.type')).":" !!}<span class="red">*</span>
                            </div>
                            <div class="col-sm-9 d-flex justify-content-around">
                                <div>
                                    {!! Form::radio('group_type', 1, true, ['class' => 'group-type', 'id' => 'groupTypeOpen']) !!} {{ __('messages.group.open') }}
                                    <i class="fa fa-question-circle ml-2 question-type-open cursor-pointer"
                                       data-toggle="tooltip" data-placement="top"
                                       title="All group members can send messages into the group."></i>
                                </div>
                                <div>
                                    {!! Form::radio('group_type', 2, false, ['class' => 'group-type', 'id' => 'groupTypeClose']) !!} {{ __('messages.group.close') }}
                                    <i class="fa fa-question-circle ml-2 question-type-close cursor-pointer"
                                       data-toggle="tooltip" data-placement="top"
                                       title="The admin only can send messages into the group."></i></div>
                            </div>
                        </div>
                        <div class="div-group-privacy mt-4 d-flex">
                            <div class="col-sm-3 pl-0">
                                {!! Form::label('privacy', __('messages.group.privacy')).":" !!}<span
                                        class="red">*</span>
                            </div>
                            <div class="col-sm-9 d-flex justify-content-around ml-1">
                                <div>
                                    {!! Form::radio('privacy', 1, true, ['class' => 'group-privacy', 'id' => 'groupPublic']) !!} {{ __('messages.group.public') }}
                                    <i class="fa fa-question-circle ml-2 question-type-public cursor-pointer"
                                       data-toggle="tooltip" data-placement="top"
                                       title="All group members can add or remove members from the group."></i>
                                </div>
                                <div>
                                    {!! Form::radio('privacy', 2, false, ['class' => 'group-privacy', 'id' => 'groupPrivate']) !!} {{ __('messages.group.private') }}
                                    <i class="fa fa-question-circle ml-2  question-type-private cursor-pointer"
                                       data-toggle="tooltip" data-placement="top"
                                       title="The admin only can add or remove members from the group."></i>
                                </div>
                            </div>
                        </div>
                    </div>
                    <div class="col-sm-6">
                        {!! Form::label('description', __('messages.group.description')) !!}
                        {!! Form::textarea('description', null,['class' => 'form-control', 'rows' => 5, 'id' => 'groupDesc']) !!}
                    </div>
                </div>
                <div class="row">
                    <div class="col-sm-12">
                        {!! Form::label('users', __('messages.group.members')).":" !!}<span class="red">*</span>
                        {!! Form::select('users[]', $users, null, ['class' => 'form-control', 'id' => 'groupMembers', 'multiple', 'required', ]) !!}
                    </div>
                </div>
                <div class="row mt-3">
                    <div class="col-sm-12 text-right">
                        {!! Form::button(__('messages.save'), ['type'=>'submit','class' => 'btn btn-primary','id'=>'btnCreateGroup','data-loading-text' => "<span class='spinner-border spinner-border-sm'></span> Processing..."]) !!}
                        <button type="button" id="btnCancel" class="btn btn-secondary ml-1"
                                data-dismiss="modal">{{ __('messages.cancel') }}
                        </button>
                    </div>
                </div>
            </div>
            {!! Form::close() !!}
        </div>
    </div>
</div>
