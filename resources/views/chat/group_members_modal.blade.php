<div id="modalAddGroupMembers" class="modal fade" role="dialog" tabindex="-1">
    <div class="modal-dialog modal-dialog-centered">
        <!-- Modal content-->
        <div class="modal-content">
            <div class="modal-header border-0 pb-0">
                <h5 class="modal-title">
                    <i class="ti-user"></i>Add Members
                </h5>
                <button type="button" class="close" data-dismiss="modal" aria-label="Close">
                    &times;
                </button>
            </div>
            <div class="modal-body">
                <form class="mb-2">
                    <input type="text" class="form-control search-input" id="searchMembersToAddInGroup"
                           placeholder="{{ __('messages.search') }}...">
                </form>
                <div id="divGroupMembersForChat">
                    <ul class="list-group user-list-chat-select" id="groupMembersForChat"></ul>
                    <div class="text-center no-group-members new-conversation__no-user">
                        <div class="chat__not-selected">
                            <div class="text-center"><i class="fa fa-2x fa-user" aria-hidden="true"></i>
                            </div>
                            {{ __('messages.no_user_found') }}
                        </div>
                    </div>
                </div>
                <button class="btn btn-success mt-1 btn-add-members-to-group pull-right mt-3" data-group-id=""
                        data-loading-text="<span class='spinner-border spinner-border-sm'></span> Processing...">Add
                    To Group
                </button>
            </div>
        </div>
    </div>
</div>