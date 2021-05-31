<div id="viewReportNoteModal" class="modal fade" role="dialog" tabindex="-1">
    <div class="modal-dialog modal-lg">

        <!-- Modal content-->
        <div class="modal-content">
            <div class="modal-header">
                <h4 class="modal-title">{{ __('messages.reported_user') }}</h4>
                <button type="button" class="close" data-dismiss="modal">&times;</button>
            </div>
            <div class="modal-body">
                <div class="col-sm-12">
                    <div class="row">
                        <div class="col-sm-6">
                            <label class="font-weight-bold">{{__('messages.reported_by')}}</label>: <span class="reported-by"></span>
                        </div>
                        <div class="col-sm-6">
                            <label class="font-weight-bold">{{__('messages.reported_to')}}</label>: <span class="reported-to"></span>
                        </div>
                    </div>
                </div>
                <div class="col-sm-12 mt-1">
                    <label class="font-weight-bold">{{__('messages.notes')}}</label>
                    <div class="reported-user-notes"></div>
                </div>
                <div class="text-right form-group col-sm-12 mt-2">
                    <button type="button" class="btn btn-secondary ml-1" data-dismiss="modal">{{ __('messages.group.close') }}</button>
                </div>
            </div>
        </div>

    </div>
</div>
