<!-- Modal -->
<div class="modal fade" id="fileUpload" tabindex="-1" role="dialog" aria-labelledby="exampleModalLabel" aria-hidden="true">
    <div class="modal-dialog modal-dialog-centered modal-lg" role="document">
        <div class="modal-content">
            <h5 class="file-upload-heading">{{ __('messages.upload_files') }}</h5>
            <button type="button" class="close file-upload-close-btn" data-dismiss="modal" aria-label="Close">
                <span aria-hidden="true">&times;</span>
            </button>
            <div class="modal-body">
                <form action="{{route('file-upload')}}"
                      class="dropzone conversation-dropzone"
                      id="dropzone">
                    {{csrf_field()}}
                </form>
                <div class="d-flex mt-3 float-right">
                    <button id="submit-all" class="upload-file-btn btn btn-primary mr-2">{{ __('messages.upload') }}</button>
                    <button type="reset" id="cancel-upload-file"
                            class="upload-file-btn btn btn-secondary">{{ __('messages.cancel') }}</button>
                </div>
            </div>
        </div>
    </div>
</div>
