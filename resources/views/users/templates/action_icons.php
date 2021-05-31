<script id="tmplAddChatUsersList" type="text/x-jsrender">
{{if !archive}}
<button title="Edit" class="index__btn btn btn-ghost-success btn-sm edit-btn" data-id="{{:id}}">
    <i class="cui-pencil action-icon"></i>
</button>
<button title="Archive" class="index__btn btn btn-ghost-danger btn-sm archive-btn" data-id="{{:id}}">
    <i class="fa fa-archive action-icon"></i>
</button>
{{/if}}
{{if archive}}
<button title="Restore" class="index__btn btn btn-ghost-success btn-sm restore-btn" data-id="{{:id}}">
    <i class="fa fa-level-up action-icon"></i>
</button>
<button title="Delete" class="index__btn btn btn-ghost-danger btn-sm delete-btn" data-id="{{:id}}">
    <i class="cui-trash action-icon"></i>
</button>
{{/if}}
</script>
