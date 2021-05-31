<script id="tmplAddGroupMembers" type="text/x-jsrender">
{{for users}}
    {{if ~isMembersInGroup(~root.group_members, id)}}
    <li class="list-group-item group-members-list-chat-select__list-item  align-items-center d-flex justify-content-between opacity-07" id="groupMember-{{:id}}">
        <div class="d-flex">
        <input type="hidden" class="add-chat-user-id" value="{{:id}}">
        <div class="new-conversation-img-status position-relative mr-2 user-{{:id}}" data-status="0" data-is-group="1">
            <div class="new-conversation-img-status__inner">
                <img src="{{:photo_url}}" alt="user-avatar-img" class="user-avatar-img add-user-img">
            </div>
        </div>
        <span class="add-user-contact-name align-self-center">{{:name}}</span>
        </div>
        <div><input name="group_members" type="checkbox" class="select-group-members" value="{{:id}}" checked disabled></div>
    </li>
    {{else}}
    <li class="list-group-item group-members-list-chat-select__list-item align-items-center d-flex justify-content-between" id="groupMember-{{:id}}">
        <div class="d-flex">
        <input type="hidden" class="add-chat-user-id" value="{{:id}}">
        <div class="new-conversation-img-status position-relative mr-2 user-{{:id}}" data-status="0" data-is-group="1">
            <div class="new-conversation-img-status__inner">
                <img src="{{:photo_url}}" alt="user-avatar-img" class="user-avatar-img add-user-img">
            </div>
        </div>
        <span class="add-user-contact-name align-self-center">{{:name}}</span>
        </div>
        <div><input name="group_members" type="checkbox" class="select-group-members" value="{{:id}}"></div>
    </li>
    {{/if}}
{{/for}}

</script>