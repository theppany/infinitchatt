let chatSendArea = $.templates('#tmplChatSendArea').render();
let newMessageIndicator = $.templates('#tmplNewMsgIndicator').render();
let blockedMessageText = $.templates('#tmplBlockMsgText').render();
let blockedByMessageText = $.templates('#tmplBlockByMsgText').render();
let hdnTextMessage = $.templates('#tmplHiddenTxtMsg').render();
let closedGroupIcon = $.templates('#tmplCloseGroupIcon').render();
let privateGroupIcon = $.templates('#tmplPrivateGroupIcon').render();

let totalUnreadConversations = 0;

let unreadMessageIds = [];
let readMessageFunctionInterval = false;
let readedMessageIds = [];

// we are loading 8000 messages at a time, so when real time messages are occurs,
// scroll is moved to bottom and then after?msg_id=123 api is calling which should be not called
// so this variable prevent that behaviour, and not call that api when realtime messages are coming
let callAfterAPI = true;
let callBeforeAPI = false;

let noConversationEle = $('.no-conversation');
let noArchiveConversationEle = $('.no-archive-conversation');
noConversationEle.hide();
noArchiveConversationEle.hide();
noConversationEle.removeClass('d-none');

$(document).ready(function () {
    const mediaTypeImage = 1;
    const mediaTypePdf = 2;
    const mediaTypeDocx = 3;
    const mediaTypeVoice = 4;
    const mediaTypeVideo = 5;
    const youtubeUrl = 6;
    const mediaTypeTxt = 7;
    const mediaTypeXls = 8;

    let selectedContactId = '';
    let selectedContactImg = '';
    let timer = null;
    let myRoleInGroup, currentSelectedGroupId = null;
    let startTyping = true;
    let lastMessageIdForScroll = '';
    let limit = 20;
    let shouldCallApiTop = true;
    let shouldCallApiBottom = true;
    let placeCaret = true;
    let scrollAtLastMsg = false;
    let isAllMessagesRead = false;
    let appendGroupMessagesAtLast = true;
    let previousDate = [];
    let isDraftMsg = 0;
    let blockedUsersList = [];
    let groupMembers = [];
    let myContactIds = [];
    let groupMembersInfo = [];
    let conversationMessages = [];
    let currentConversationGroupId = '';

    let chatPeopleBodyEle = $('#chatPeopleBody');
    let archivePeopleBodyEle = $('#archivePeopleBody');
    let noMsgesYet = $('.chat__not-selected');
    let membersCountArr = [];

    $('#myTab a').on('hidden.bs.tab', function () {
        $('#searchContactForChat').val('').keyup();
        $('#searchGroupsForChat').val('').keyup();
        $('#searchBlockUsers').val('').keyup();
    });

    $('#groupMembers').select2({
        width: '100%',
        placeholder: 'Select Members',
        allowClear: true,
    });

    $('input[type="radio"]').iCheck({
        checkboxClass: 'icheckbox_square',
        radioClass: 'iradio_square-blue',
        increaseArea: '20%', // optional
    });

    //add a event listener to the window that calls preventDefault() on all dragover and drop events.
    window.addEventListener('dragover', function (e) {
        e = e || event;
        e.preventDefault();
    }, false);
    window.addEventListener('drop', function (e) {
        e = e || event;
        e.preventDefault();
    }, false);

    $.ajax({
        type: 'GET',
        url: blockedUsersListURL,
        success: function (data) {
            if (data.success) {
                blockedUsersList = data.data.users_ids;
            }
        },
        error: function (error) {
            console.log(error);
        },
    });

    $.ajax({
        type: 'GET',
        url: myContactsURL,
        success: function (data) {
            if (data.success) {
                let users = data.data.users;
                if (users.length > 0) {
                    $('.no-my-contact').hide();
                    let helpers = {
                        checkUserStatusForGroupMember: checkUserStatusForGroupMember,
                        isInBlockedList: isInBlockedList,
                        getGender: getGender,
                        getOnOffClass: getOnOffClass
                    };
                    let template = $.templates('#tmplMyContactsUsersList');
                    let htmlOutput = template.render(data.data, helpers);
                    $('#myContactListForChat').html(htmlOutput);

                    let myAllContactIds = data.data.myContactIds;
                    $.each(myAllContactIds, (index, val) => {
                        myContactIds.push(val);
                    });
                }
            }
        },
        error: function (error) {
            console.log(error);
        },
    });

    window.isInBlockedList = function (userId) {
        if (($.inArray(userId, blockedUsersList) != -1)) {
            return false;
        }

        return true;
    };

    $.ajax({
        type: 'GET',
        url: blockUsersByMeURL,
        success: function (data) {
            if (data.success) {
                if (data.data.users.length > 0) {
                    $('.no-blocked-user').hide();
                    prepareBlockedUsers(data.data);
                }
            }
        },
        error: function (error) {
            console.log(error);
        },
    });

    $.ajax({
        type: 'GET',
        url: userListURL,
        success: function (data) {
            if (data.success) {
                let users = data.data.users;
                if (users.length > 0) {
                    $('.no-user').hide();
                    prepareContactForModal(data.data);
                }
            }
        },
        error: function (error) {
            console.log(error);
        },
    });

    // Get Groups List
    $.ajax({
        type: 'GET',
        url: groupsList,
        success: function (result) {
            if (result.success) {
                if (result.data.length > 0) {
                    $('.no-group').hide();
                }

                $.each(result.data, function (i, group) {
                    listenForGroupUpdates(group.id);
                });

                let template = $.templates('#tmplGroupListing');
                let htmlOutput = template.render(result);
                $('#groupListForChat').html(htmlOutput);
            }
        },
        error: function (error) {
            console.log(error);
        },
    });

    $.ajax({
        type: 'GET',
        url: conversationListURL,
        success: function (data) {
            if (data.success) {
                $('#infyLoader').hide();
                let latestConversations = data.data.conversations;
                if (latestConversations.length === 0) {
                    noConversationEle.show();
                }
                chatPeopleBodyEle.
                    append(latestConversations.map(prepareContacts).join(''));

                searchUsers();
                loadTooltip();
            }
        },
        error: function (error) {
            console.log(error);
        },
    });

    //GET Archive conversations list
    $.ajax({
        type: 'GET',
        url: archiveConversationListURL,
        success: function (data) {
            if (data.success) {
                let archiveConversations = data.data.conversations;
                if (archiveConversations.length === 0) {
                    noArchiveConversationEle.show();
                }
                archivePeopleBodyEle.
                    append(archiveConversations.map(prepareContacts).join(''));

                archivePeopleBodyEle.find('.chat__person-box-archive').
                    each(function () {
                        $(this).text('Unarchive Chat');
                    });

                searchUsers();
            }
        },
        error: function (error) {
            console.log(error);
        },
    });

    // bind click for recent chat user select
    let latestSelectedUser;
    let textMessageEle = $('#textMessage');

    $(document).on('click', '.chat__person-box', function (e) {
        callBeforeAPI = false;
        $('.chat-conversation').html('');
        noConversationEle.hide();
        scrollAtLastMsg = false;
        callAfterAPI = true;
        previousDate = [];
        isDraftMsg = 0;
        $('.chat__person-box').removeClass('chat__person-box--active');
        $(this).addClass('chat__person-box--active');
        selectedContactId = $(e.currentTarget).data('id');
        let isGroup = $(e.currentTarget).data('is_group');
        let lastDraftMsg = getLocalStorageItem('user_' + selectedContactId);
        let urlDetail = userURL + selectedContactId + '/conversation';
        $.ajax({
            type: 'GET',
            url: urlDetail,
            data: { 'is_group': isGroup },
            success: function (data) {
                shouldCallApiTop = true;
                shouldCallApiBottom = true;
                callBeforeAPI = true;
                let lastMsg = data.data.conversations[data.data.conversations.length -
                1];
                lastMessageIdForScroll = (data.data.conversations.length !== 0)
                    ? lastMsg.id
                    : 0;
                latestSelectedUser = $('.chat__person-box--active').data('id');
                //put this (latestSelectedUser == data.user.id) condition bcz if responce come little late and user has already switch to another user than it shows data blink
                let groupOrUserObj = null;
                if (data.data.user === null) {
                    groupOrUserObj = data.data.group;
                }
                if (data.data.group === null) {
                    groupOrUserObj = data.data.user;
                }
                let isMyContact = false;
                if (groupOrUserObj.hasOwnProperty('is_my_contact')) {
                    isMyContact = groupOrUserObj.is_my_contact;
                }
                setIsMyContactAttribute(latestSelectedUser, isMyContact);
                if (data.success && latestSelectedUser === groupOrUserObj.id) {
                    if (checkUserStatus(groupOrUserObj)) {
                        let userEle = $('#user-' + selectedContactId);
                        let template = $.templates('#tmplUserNewStatus');
                        let htmlOutput = template.render(
                            groupOrUserObj.user_status);
                        userEle.find('.contact-status').html(htmlOutput);
                    }
                    let conversations = data.data.conversations.reverse();
                    selectedContactId = groupOrUserObj.id;
                    selectedContactImg = groupOrUserObj.photo_url;
                    $('#user-' + selectedContactId).
                        find('.user-avatar-img').
                        attr('src', selectedContactImg);
                    let chatHeader = prepareChatHeader(groupOrUserObj,
                        conversations);

                    let conversation = chatHeader;
                    /** Do not show chat input box if user is blocked */
                    if (!groupOrUserObj.hasOwnProperty('is_blocked') ||
                        !groupOrUserObj.is_blocked) {
                        conversation += chatSendArea;
                    } else {
                        conversation += hdnTextMessage;
                    }

                    // When User click on groups members then perform below action
                    if ($('.chat__people-body').
                        find('.chat__person-box--active').length <= 0) {
                        var isUserElePresent = $('.chat__people-body').
                            find('#user-' + groupOrUserObj.id).length;
                        if (!isUserElePresent) {
                            let newUserEle = prepareNewConversation(
                                groupOrUserObj.id,
                                groupOrUserObj.name,
                                '',
                                groupOrUserObj.photo_url,
                                groupOrUserObj.is_online,
                                0,
                            );
                            chatPeopleBodyEle.prepend(newUserEle);
                            $('#user-' + groupOrUserObj.id).
                                addClass('chat__person-box--active');
                        }
                    }

                    if (groupOrUserObj.hasOwnProperty('is_super_admin') &&
                        groupOrUserObj.is_super_admin) {
                        $('.chat-profile__switch-checkbox').addClass('d-none');
                    } else {
                        $('.chat-profile__switch-checkbox').
                            removeClass('d-none');
                    }

                    $('.chat__area-wrapper').html(conversation);
                    if (isGroup === 0 && !isMyContact &&
                        groupOrUserObj.is_req_send_receive) {
                        let chatRequest = data.data.chat_request;
                        let chatReqObj = groupOrUserObj;
                        chatReqObj.chat_req = chatRequest;
                        if (chatRequest.from_id == loggedInUserId) {
                            setSendChatReqTemplate(chatReqObj);
                            $('.chat__area-text').addClass('d-none');
                            $('.typing').addClass('d-none');
                            return false;
                        } else {
                            groupOrUserObj.chat_req_id = chatRequest.id;
                            setReceiveChatReqTemplate(chatReqObj);
                            $('.chat__area-text').addClass('d-none');
                            $('.typing').addClass('d-none');
                            return false;
                        }
                    }
                    if (isGroup === 0 && !isMyContact &&
                        groupOrUserObj.privacy == 0) {
                        let chatReqObj = groupOrUserObj;
                        chatReqObj.chat_req = null;
                        setSendChatReqTemplate(chatReqObj);
                        $('.chat__area-text').addClass('d-none');
                        $('.typing').addClass('d-none');
                        return false;
                    }
                    noConversationEle.hide();
                    let firstUnreadEle = $('.chat-conversation .unread').
                        first();
                    firstUnreadEle.before(newMessageIndicator);
                    if (!isGroup) {
                        fireReadMessageEvent(conversations);
                    } else {
                        let unreadIds = getUnreadGroupMessageIds(conversations);
                        fireReadMessageEventUsingIds(unreadIds);
                    }
                    if (firstUnreadEle.length > 0) {
                        scrollAtEle(firstUnreadEle);
                    } else {
                        shouldCallApiBottom = false;
                        let lastEle = $('.chat-conversation').children().last();
                        scrollAtEle(lastEle);
                    }
                    (data.data.conversations.length === 0)
                        ? addNoMessagesIndicator()
                        : '';
                    if (isGroup) {
                        setGroupProfileData(groupOrUserObj, data.data.media);
                        if (!groupOrUserObj.removed_from_group) {
                            listenForGroupMessageTyping(groupOrUserObj.id);
                        }
                        loadTooltip();
                    } else {
                        setUserProfileData(groupOrUserObj, data.data.media);
                    }
                    getMessageByScroll(isGroup);
                    setOpenProfileEvent();
                    setOpenMessageSearchEvent();
                    setOpenMsgInfoEvent();

                    textMessageEle = $('#textMessage');
                    textMessageEle.emojioneArea({
                        saveEmojisAs: 'shortname',
                        autocomplete: true,
                        textcomplete: {
                            maxCount: 15,
                            placement: 'top',
                        },
                        events: {
                            focus: function (editor) {
                                placeCaretAtEnd(editor[0]);
                            },
                        },
                    });
                    if (lastDraftMsg !== '' && lastDraftMsg !== null) {
                        isDraftMsg = 1;
                        textMessageEle[0].emojioneArea.setText(lastDraftMsg);
                        removeLocalStorageItem('user_' + selectedContactId);
                        $('#btnSend').
                            removeClass('chat__area-send-btn--disable');
                    }
                    textMessageEle.data('emojioneArea').setFocus();
                    if ((isGroup && groupOrUserObj.group_type === 2 &&
                        groupOrUserObj.my_role !== 2) ||
                        groupOrUserObj.removed_from_group) { // Group type is close then only admin can send message
                        //hide inputs
                        $('.chat__area-text').remove();
                    }
                    sendMessage();
                    
                    groupMembersInfo = [];
                    conversationMessages = [];
                    currentConversationGroupId = '';
                    if (isGroup) {
                        currentConversationGroupId = data.data.group.id;
                        prepareMessageReadInfo(data.data.conversations, data.data.group.users);
                    } else {
                        prepareMessageReadInfo(data.data.conversations, []);
                    }
                }

                if (getLocalStorageItem('reply')) {
                    let replyData = JSON.parse(getLocalStorageItem('reply'));
                    if (replyData.user_id == selectedContactId) {
                        prepareReplyBox(replyData);
                    }
                }

                if (!isGroup && data.data.user.is_blocked_by_auth_user) {
                    $('.chat__area-wrapper').append(blockedMessageText);
                } else if (!isGroup && data.data.user.is_blocked &&
                    !data.data.user.is_blocked_by_auth_user) {
                    $('.chat__area-wrapper').append(blockedMessageText);
                    $('.blocked-message-text span').
                        text('You are blocked by this user.');
                }

                updateUnreadMessageCount(1);
                readNotificationWhenOpenChatWindow(selectedContactId);
                loadTooltip();
            },
            error: function (error) {
                console.log(error);
            },
        });

        $('.chat__area-wrapper').on('dragover', function (event) {
            event.preventDefault();
            event.stopPropagation();
            $('#fileUpload').modal('show');
        });
    });

    window.prepareMessageReadInfo = function(messages, members){
        $.each(members, function (index, val) {
            if (val.id != loggedInUserId) {
                let data = {
                    'user_id': val.id,
                    'name': val.name,
                    'photo_url': val.photo_url
                };
                groupMembersInfo[val.id] = data;
            }
        });
        $.each(messages, function (index, val) {
            conversationMessages.push(val);
        });
    };

    window.checkReqAlreadySent = function (chatReqObj) {
        if (chatReqObj) {
            return (chatReqObj.status == 0) ? true : false;
        }
        return false;
    };

    window.checkReqAlreadyDeclined = function (chatReqObj) {
        if (chatReqObj) {
            return (chatReqObj.status == 2) ? true : false;
        }
        return false;
    };

    window.setSendChatReqTemplate = function (user) {
        let template = $.templates('#sendRequestTmpl');
        let myHelpers = {
            checkReqAlreadySent: checkReqAlreadySent,
        };
        let htmlOutput = template.render(user, myHelpers);

        $('#conversation-container').html(htmlOutput);
    };

    window.setReceiveChatReqTemplate = function (user) {
        let template = $.templates('#getChatRequestTmpl');
        let myHelpers = {
            checkReqAlreadyDeclined: checkReqAlreadyDeclined,
        };
        let htmlOutput = template.render(user, myHelpers);

        $('#conversation-container').html(htmlOutput);
    };

    window.setIsMyContactAttribute = function (userId, isMyContact) {
        let conversationEle = $('#user-' + userId);
        let isGroup = conversationEle.data('is_group');
        if (isGroup === 1) {
            conversationEle.attr('data-is_my_contact', true);
            return true;
        }
        conversationEle.attr('data-is_my_contact', isMyContact);
    };

    $(document).on('click', '#sendChatRequest', function (e) {
        let userId = $(this).data('id');
        let data = {
            'to_id': userId,
            'message': $('#chatRequestMessage-' + userId).val(),
        };
        $.ajax({
            type: 'POST',
            url: sendChatReqURL,
            data: data,
            success: function (data) {
                if (data.success) {
                    displayToastr('success', 'success', data.message);
                    $('#chatRequestMessage-' + userId).val('');
                    $('.request__content-title').
                        text('You have send request to this user.');
                    $('.send__request__message').hide();
                }
            },
            error: function (error) {
                displayToastr('error', 'error', error.responseJSON.message);
            },
        });
    });

    $(document).on('click', '#acceptChatReq', function (e) {
        let chatReqId = $(this).data('id');
        let data = {
            'id': chatReqId,
        };
        $.ajax({
            type: 'POST',
            url: acceptChatReqURL,
            data: data,
            success: function (data) {
                if (data.success) {
                    displayToastr('success', 'success', data.message);
                    $('#user-' + data.data.from_id).trigger('click');
                }
            },
            error: function (error) {
                displayToastr('error', 'error', error.responseJSON.message);
            },
        });
    });

    $(document).on('click', '#declineChatReq', function (e) {
        let chatReqId = $(this).data('id');
        let data = {
            'id': chatReqId,
        };
        $.ajax({
            type: 'POST',
            url: declineChatReqURL,
            data: data,
            success: function (data) {
                if (data.success) {
                    displayToastr('success', 'success', data.message);
                    $('#user-' + data.data.from_id).
                        find('.chat__person-box-count').
                        addClass('d-none').
                        text(0);
                    $('#user-' + data.data.from_id).trigger('click');
                }
            },
            error: function (error) {
                displayToastr('error', 'error', error.responseJSON.message);
            },
        });
    });

    function placeCaretAtEnd (el) {
        if (!placeCaret) {
            return;
        }

        if (typeof window.getSelection != 'undefined'
            && typeof document.createRange != 'undefined') {
            var range = document.createRange();
            range.selectNodeContents(el);
            range.collapse(false);
            var sel = window.getSelection();
            sel.removeAllRanges();
            sel.addRange(range);
        } else if (typeof document.body.createTextRange != 'undefined') {
            var textRange = document.body.createTextRange();
            textRange.moveToElementText(el);
            textRange.collapse(false);
            textRange.select();
        }
    }

    $(document).on('click', '[data-toggle="lightbox"]', function (event) {
        event.preventDefault();
        $(this).ekkoLightbox();
    });

    $(document).on('click', '[data-toggle="media"]', function (event) {
        event.preventDefault();
        $(this).ekkoLightbox();
    });

    $('body').tooltip({
        selector: '.profile-media',
        placement: 'top',
        boundary: 'window',
        trigger: 'hover',
    });

    function setUserProfileData (user, media = []) {
        $('.chat-profile').empty();

        let template = $.templates('#tmplUserDetails');
        let myHelpers = {
            prepareMedia: prepareMedia,
            getCalenderFormatForLastSeen: getCalenderFormatForLastSeen,
            disabledIfReported: disabledIfReported,
        };
        user.media = media;

        let htmlOutput = template.render(user, myHelpers);

        $('.chat-profile').html(htmlOutput);
    }
    
    window.disabledIfReported = function(reportedUser) {
        if (reportedUser == null) {
            return '';
        }
        return 'disabled';
    };
    
    $(document).on('click', '#open-report-user-modal', function () {
        let userId = $(this).attr('data-id');
        $('#reportUserId').val(userId);
        $('#reportUserNote').val('');
        $('#reportUserValidationErrorsBox').hide().text('');
        $('#reportUserModal').modal('show');
    });
    
    $(document).on('keyup', '#reportUserNote', function () {
        $('#reportUserValidationErrorsBox').hide().text('');
    });

    $(document).on('click', '#reportUser', function () {
        let loadingButton = $(this);
        let userId = $("#reportUserId").val();
        let reportUserNote = $("#reportUserNote").val();
        if (reportUserNote === '') {
            $('#reportUserValidationErrorsBox').
                show().
                text('The notes field is required.');
            return false;
        }
        loadingButton.button('loading');
        let data = {
            'reported_to': userId,
            'notes': reportUserNote
        };
        $.ajax({
            type: 'POST',
            url: reportUserURL,
            data: data,
            success: function (data) {
                $('#open-report-user-modal').prop('disabled', true);
                displayToastr('Success', 'success', data.message);
                $('#reportUserModal').modal('hide');
            },
            error: function (data) {
                $('#reportUserValidationErrorsBox').show().text(data.responseJSON.message);
            },
            complete: function () {
                loadingButton.button('reset');
            },
        });
    });

    window.displaySideMedia = function (mediaObj) {
        $('.no-photo-found').hide();
        let mediaHtml = prepareMedia(mediaObj);
        $('.chat-profile__media-container').append(mediaHtml);
        $('[data-toggle="tooltip"]').tooltip();
    };

    // move chat conversation to last messages
    function scrollToLastMessage (isScrollLast = true) {
        scrollAtLastMsg = true;
        let chatConversation = $('.chat-conversation');
        let height = chatConversation.prop('scrollHeight');
        if (!isScrollLast) {
            height = height / 2;
        }
        chatConversation.scrollTop(height);
    }

    window.prepareMedia = function (data) {
        if (data.message_type === mediaTypeImage) {
            return imageRendererInSideMedia(data.message, data.id);
        } else if (data.message_type === mediaTypePdf) {
            return sideMediaRenderer(data.message, data.file_name,
                'fa-file-pdf-o', data.id);
        } else if (data.message_type === mediaTypeDocx) {
            return sideMediaRenderer(data.message, data.file_name,
                'fa-file-word-o', data.id);
        } else if (data.message_type === mediaTypeVideo) {
            return sideMediaRenderer(data.message, data.file_name,
                'fa-file-video-o', data.id);
        } else if (data.message_type === youtubeUrl) {
            return sideMediaRenderer(data.message, data.message,
                'fa fa-youtube-play', data.id);
        } else if (data.message_type === mediaTypeTxt) {
            return sideMediaRenderer(data.message, data.file_name,
                'fa-file-text-o', data.id);
        } else if (data.message_type === mediaTypeXls) {
            return sideMediaRenderer(data.message, data.file_name,
                'fa-file-excel-o', data.id);
        } else if (data.message_type === mediaTypeVoice) {
            return sideMediaRenderer(data.message, data.file_name,
                'fa-file-audio-o', data.id);
        } else {
            return '';
        }
    };

    function setGroupProfileData (group, media) {
        currentSelectedGroupId = group.id;
        var template = $.templates('#tmplGroupDetails');
        var myHelpers = {
            prepareMedia: prepareMedia,
            getLocalDate: getLocalDate,
            checkUserStatusForGroupMember: checkUserStatusForGroupMember,
        };
        group.media = media;
        group.logged_in_user_id = parseInt(loggedInUserId);
        group.members_count = group.users.length;
        membersCountArr[group.id] = group.users.length;
        myRoleInGroup = group.my_role;

        groupMembers = pluck(group.users, 'id');
        var htmlOutput = template.render(group, myHelpers);

        $('.chat-profile').empty();
        $('.chat-profile').html(htmlOutput);
    }

    function pluck (objs, name) {
        var sol = [];
        for (var i in objs) {
            if (objs[i].hasOwnProperty(name)) {
                // console.log(objs[i][name]);
                sol.push(objs[i][name]);
            }
        }
        return sol;
    }

    // move chat conversation to last messages
    function scrollToLastMessage (isScrollLast = true) {
        scrollAtLastMsg = true;
        let chatConversation = $('.chat-conversation');
        let height = chatConversation.prop('scrollHeight');
        if (!isScrollLast) {
            height = height / 2;
        }
        chatConversation.scrollTop(height);
    }

    window.scrollTop = function () {
        let ele = $('.chat-conversation');
        ele.scrollTop(50);
    };

    window.scrollAtEle = function (element) {
        if (element.length > 0) {
            let ele = $('.chat-conversation');
            let position = element.position();
            ele.scrollTop(position.top - 100);
        }
    };

    let chatProfileEle = $('.chat-profile');

    function setOpenProfileEvent () {
        $('.open-profile-menu, .chat-profile__close-btn').
            on('click', function (e) {
                profileToggle();
                if ($(this).parents('.dropdown-menu').length) {
                    $(this).parents('.dropdown-menu').removeClass('show');
                }
                //added this bcz after this, it will not consider document click event and will not close profile
                e.stopPropagation();
            });
    }

    $(document).on('click', '.ekko-lightbox', function (e) {
        // using this when we click anywhere (outside if image modal also), it will not consider document click event so profile and conversation-list sidebar will remain as it was before opening image
        // $(document).on('click', '.ekko-lightbox-nav-overlay', function (e) { // if want to do same with only arraow of image than use this class
        e.stopPropagation();
    });

    window.profileToggle = function () {
        if (chatProfileEle.hasClass('chat-profile--active')) {
            chatProfileEle.
                removeClass('chat-profile--active').
                addClass('chat-profile--out');
            setTimeout(() => {
                chatProfileEle.toggle();
            }, 300);
        } else {
            closeMsgInfo();
            chatProfileEle.
                addClass('chat-profile--active').
                removeClass('chat-profile--out').
                toggle();
        }
    };

    window.closeProfileInfo = function () {
        if (chatProfileEle.hasClass('chat-profile--active')) {
            chatProfileEle.
                removeClass('chat-profile--active').
                addClass('chat-profile--out');
            chatProfileEle.toggle();
        }
    };

    let msgInfoEle = $('.msg-info');
    window.setOpenMsgInfoEvent = function() {
        $('.open-msg-info').on('click', function (e) {
            let messageId = $(this).attr('data-message-id');
            let isGroup = $(this).attr('data-is_group');
            if (isGroup === '1' && typeof messageId != 'undefined') {
                setReadByContactsInfo(messageId);
            } else {
                setReadByMessageInfo(messageId);
            }
            openMsgInfo();
            e.stopPropagation();
        });
        $('.msg-info__close-btn').on('click', function (e) {
            closeMsgInfo();
            e.stopPropagation();
        });
    }

    window.openMsgInfo = function () {
        closeProfileInfo();
        if (!msgInfoEle.hasClass('msg-info--active')) {
            msgInfoEle.
                addClass('msg-info--active').
                removeClass('msg-info--out').
                show();
        }
    };

    window.closeMsgInfo = function () {
        if (msgInfoEle.hasClass('msg-info--active')) {
            msgInfoEle.
                removeClass('msg-info--active').
                addClass('msg-info--out');
            msgInfoEle.hide();
        }
    };
    
    window.setReadByContactsInfo = function (messageId) {
        let messageInfo = getMsgInfoFromconversationMessages(messageId);
        if (messageInfo !== null) {
            showMessageInMessageInfo(messageInfo);
            showConversationInfo(messageInfo);
        }   
    };

    window.setReadByMessageInfo = function (messageId) {
        let messageInfo = getMsgInfoFromconversationMessages(messageId);
        if (messageInfo !== null) {
            showSingleConversationInfo(messageInfo);
        }   
    };

    window.checkReadAtDate = function (readAt) {
        return (readAt == null || readAt == '' || readAt == '0000-00-00 00:00:00') ? false : true;
    };
    
    window.prepareReadByContactsInfoHtml = function (readByUsers) {
        let template = $.templates('#groupMsgReadUnreadInfo');
        let helpers = {
            getCalenderFormatForLastSeen: getCalenderFormatForLastSeen,
            checkReadAtDate: checkReadAtDate,
        };
        return template.render(readByUsers, helpers);
    };

    let remainingUsersEle = $('#remaining-users');
    let remainingUsersListEle = $('#remaining-users-list');
    let remainingUsersSectionEle = $('#remaining-users-section');
    let remainingUsersDividerEle = $('#remaining-users-divider');
    let readByUsersEle = $('#read-by-users');
    let readByUsersDivider = $('#read-by-users-divider');
    let readByUsersSection = $('#read-by-users-section');
    let singleMsgDivider = $('#single-msg-divider');
    let singleMsgSection = $('#single-msg-section');
    
    window.showConversationInfo = function (messageInfo) {
        let readByUsers = [];
        let remainingUsers = [];
        if (messageInfo !== null) {
            showMessageInMessageInfo(messageInfo);
            $.each(messageInfo.read_by, function (index, val) {
                val.user = groupMembersInfo[val.user_id];
                if (val.read_at != null) {
                    readByUsers.push(val);
                } else {
                    remainingUsers.push(val);
                }
            });
        }

        resetReadByUsers();
        if (remainingUsers.length > 0) {
            remainingUsersEle.text(remainingUsers.length + ' remaining').attr('data-remaining_count', remainingUsers.length);
            let remainingUsersHtml = prepareReadByContactsInfoHtml(remainingUsers);
            remainingUsersListEle.html(remainingUsersHtml);
            remainingUsersDividerEle.show();
            remainingUsersSectionEle.show();
        }

        readByUsersEle.attr('class', 'message-'+messageInfo.id+'-read-by-users');
        readByUsersEle.html('');
        if (readByUsers.length > 0) {
            let readByUsersHtml = prepareReadByContactsInfoHtml(readByUsers);
            readByUsersEle.html(readByUsersHtml);
            readByUsersDivider.show();
            readByUsersSection.show();
        }
    };
    
    window.showSingleConversationInfo = function (messageInfo) {
        if (messageInfo !== null) {
            remainingUsersDividerEle.show();
            readByUsersDivider.show();
            singleMsgSection.show().html('');
            showMessageInMessageInfo(messageInfo);

            let helpers = {
                getCalenderFormatForLastSeen: getCalenderFormatForLastSeen,
            };
            let template = $.templates('#singleMessageReadInfoTmpl');
            let msgHtml = template.render(messageInfo, helpers);
            $("#single-msg-section").html(msgHtml);
        }
        resetSingleMessageReadByInfo();
    };

    window.resetSingleMessageReadByInfo = function() {
        remainingUsersSectionEle.hide();
        readByUsersSection.hide();
    };
    
    window.resetReadByUsers = function() {
        remainingUsersEle.text('').attr('data-remaining_count', 0);
        remainingUsersListEle.html('');
        remainingUsersDividerEle.hide();
        remainingUsersSectionEle.hide();

        readByUsersEle.html('');
        readByUsersDivider.hide();
        readByUsersSection.hide();

        singleMsgDivider.hide();
        singleMsgSection.hide().html('');
    };
    
    window.getMsgInfoFromconversationMessages = function(messageId) {
        let messageInfo = null;
        $.each(conversationMessages, function (index, val) {
            if (val.id == messageId) {
                messageInfo = val;
                return false;
            }
        });
        
        return messageInfo;
    };
    
    window.showMessageInMessageInfo = function(messageInfo) {
        let templateData = {};
        let helpers = {
            displayMessage: displayMessage,
            getChatMagTimeInConversation: getChatMagTimeInConversation,
        };
        let template = $.templates('#groupMsgReadUnreadMessage');
        templateData.data = messageInfo;
        templateData.loggedInUserId = loggedInUserId;
        let msgHtml = template.render(templateData, helpers);
        $("#msg-info-container-msg").html(msgHtml);
    };

    $(document).on('click', function () {
        //by clicking anywhere in document profile or chat side bar if any will present than it will close
        if (chatProfileEle.hasClass('chat-profile--active')) {
            chatProfileEle.
                removeClass('chat-profile--active').
                addClass('chat-profile--out');
            setTimeout(() => {
                chatProfileEle.toggle();
            }, 300);
        }

        $('.chat__people-wrapper-bar').
            addClass('fa-bars').
            removeClass('fa-times');
        $('.chat__people-wrapper').
            addClass('chat__people-wrapper--responsive');
    });

    $(document).on('click', '.chat-profile', function (e) {
        //to prevent click event of this class bcz by click of this class profile does not close
        e.stopPropagation();
    });

    $(document).on('click', '.chat__people-wrapper', function (e) {
        //to prevent click event of this class bcz by click of this class chat side bar does not close
        e.stopPropagation();
    });

    window.setOpenMessageSearchEvent = function () {
        // search msg opacity transition
        $(document).on('focus', '.chat__area-action-search-input', function () {
            $('.chat__search--conversation').css({ 'opacity': '1' });
        });

        // search msg opacity transition
        $('.chat__area-action-search-input').on('blur', function () {
            $('.chat__search--conversation').css({ 'opacity': '.5' });
        });

        // responsive search bar
        $('.open-search-bar').on('click', function () {
            $('.chat__area-action').addClass('chat__area-action--open');
            // height increased
            $('.chat__area-header').addClass('chat__area-header--active');
            $('.chat__area-action-search-input').focus();
        });

        // close search bar
        $('.chat__area-action-search-close').on('click', function () {
            $('.chat__area-action').removeClass('chat__area-action--open');
            // height initial
            $('.chat__area-header').removeClass('chat__area-header--active');
        });
    };

    //responsive chat side bar
    $('.chat__people-wrapper-bar').on('click', function (e) {
        $(this).toggleClass('fa-bars fa-times');
        $('.chat__people-wrapper').
            toggleClass('chat__people-wrapper--responsive');
        //added this bcz after this, it will not consider document click event and will not close chat side bar
        e.stopPropagation();
    });

    // responsive serach icon
    $('.chat__search-responsive-icon').on('click', function () {
        $('.chat__people-wrapper').
            removeClass('chat__people-wrapper--responsive');
        $('.chat__people-wrapper-bar').toggleClass('fa-bars fa-times');
        $('.chat__search-input').focus();
    });

    // hamburger menu
    $('#nav-icon3').on('click', function () {
        $(this).toggleClass('open');
        $('.chat__people-wrapper').
            toggleClass('chat__people-wrapper--responsive');
    });

    $('.chat__chat-contact-item').on('click', function () {
        $('.chat__chat-contact .chat__chat-contact-item').
            removeClass('chat__chat-contact--active');
        $(this).addClass('chat__chat-contact--active');
    });

    // init tooltip
    $('[data-toggle="tooltip"]').tooltip();

    let data = '';

    window.checkIsArchiveChat = function () {
        return $('.chat__person-box--active').
            parents('#archivePeopleBody').length;
    };

    window.moveConversationFromArchiveToActiveChat = function () {
        let chatEle = $('.chat__person-box--active');
        chatEle.find('.chat__person-box-archive').
            text('Archive Chat');
        $('#chatPeopleBody').prepend(chatEle);
        $('#archivePeopleBody').
            find('.chat__person-box--active').
            remove();
        makeActiveChatTabActive();
    };

    function sendMessage () {
        let previousInput = '';
        let newInput = '';
        let toId = $('#toId').val();
        let isGroup = $('.chat__person-box--active').data('is_group');
        let isArchiveChat = checkIsArchiveChat();
        data = {
            'to_id': toId,
            '_token': csrfToken,
            'is_archive_chat': isArchiveChat,
        };
        if (isGroup) {
            data.is_group = 1;
        }

        $('#btnSend').on('click', function () {
            let message = textMessageEle[0].emojioneArea.getText().trim();
            if (message === '') {
                return false;
            }
            $(this).addClass('chat__area-send-btn--disable');
            data.message = message;
            storeMessage(data);
            resetForm();
            removeLocalStorageItem('user_' + selectedContactId);
        });

        textMessageEle[0].emojioneArea.on('keyup emojibtn.click',
            function (btn, event) {
                textMessageEle[0].emojioneArea.hidePicker();
                let message = textMessageEle[0].emojioneArea.getText().trim();
                newInput = message;
                if (event && event.which === 13) {
                    if (newInput !== previousInput && !isDraftMsg) {
                        previousInput = newInput;
                        return false;
                    }
                    if (message.length === 0) {
                        $('#btnSend').addClass('chat__area-send-btn--disable');
                        return;
                    } else {
                        $('#btnSend').
                            removeClass('chat__area-send-btn--disable');
                        isTyping();
                    }
                    $('#btnSend').addClass('chat__area-send-btn--disable');
                    data.message = message;
                    storeMessage(data);
                    resetForm();
                    isDraftMsg = 0;
                    removeLocalStorageItem('user_' + selectedContactId);

                    return true;
                }
                isDraftMsg = 0;
                if (message.length === 0) {
                    $('#btnSend').addClass('chat__area-send-btn--disable');
                } else {
                    $('#btnSend').removeClass('chat__area-send-btn--disable');
                    isTyping();
                }
                previousInput = newInput;
            });

        textMessageEle[0].emojioneArea.on('blur', function (btn, event) {
            let message = textMessageEle[0].emojioneArea.getText().trim();
            if (message.length > 0) {
                setLocalStorageItem('user_' + toId, message);
            }
        });
    }

    function loadEojiArea () {
        textMessageEle = $('#textMessage');
        textMessageEle.emojioneArea({
            saveEmojisAs: 'shortname',
            autocomplete: true,
            textcomplete: {
                maxCount: 15,
                placement: 'top',
            },
            events: {
                focus: function focus (editor) {
                    placeCaretAtEnd(editor[0]);
                },
            },
        });

        textMessageEle.data('emojioneArea').setFocus();
    }

    window.storeMessage = function (reqData) {
        let isMyContact = $('#user-' + selectedContactId).data('is_my_contact');
        reqData.is_my_contact = (isMyContact) ? 1 : 0;
        var Filter = require('bad-words'),
            filter = new Filter();

        reqData.message = filter.clean(reqData.message);

        let messageType = 0;
        if ($('.chat__text-preview').length > 0) {
            messageType = $('.chat__text-preview').data('message-type');
        }
        reqData.is_group = 0;
        if (currentConversationGroupId !== '') {
            reqData.is_group = 1;
        }

        let randomMsgId = null;
        if (messageType == 0 && !reqData.file_name) {
            randomMsgId = addMessage(reqData);
        }

        let replay = false;
        if ($('.chat__text-preview').length > 0) {
            let replyTo = $('.chat__text-preview').data('message-id');
            reqData.reply_to = replyTo;
            replay = true;
            removeReplayBox();
        }

        let isArchiveChat = checkIsArchiveChat();
        reqData.is_archive_chat = isArchiveChat;
        if (isArchiveChat) {
            moveConversationFromArchiveToActiveChat();
            showNoArchiveConversationEle();
        }

        $.ajax({
            type: 'POST',
            url: sendMessageURL,
            data: reqData,
            success: function (data) {
                reqData.reply_to = '';
                if (data.success === true) {
                    let messageData = data.data.message;
                    conversationMessages.push(data.data.message);
                    $('.msg-options').
                        find('[data-message-id=' + randomMsgId + ']').
                        attr('data-message-id', messageData.id);
                    $('.msg-options').
                        find('[data-message-type=' + randomMsgId + ']').
                        attr('data-message-type', messageData.message_type);

                    if (messageType != 0) {
                        setSentOrReceivedMessage(messageData);
                    }
                    if (messageData.message_type === 0) {
                        $('.chat-conversation').
                            find('[data-message_id=' + randomMsgId + ']').
                            addClass('message-' + messageData.id).
                            attr('data-message_id', messageData.id);
                        updateMessageInSenderwindow(messageData);

                        if (messageData.url_details) {
                            $('.message-' + messageData.id).
                                find('.message').
                                empty();
                            $('.message-' + messageData.id).
                                find('.chat-conversation__bubble.clearfix').
                                addClass('max-width-35');
                            $('.message-' + messageData.id).
                                find('.message').
                                append(displayMessage(messageData));
                        }
                    } else {
                        if (messageData.message_type === 6) {
                            $('.chat-conversation').
                                find('[data-message_id=' + randomMsgId + ']').
                                remove();
                        }
                        setSentOrReceivedMessage(messageData);
                    }

                    let toUserEle = chatPeopleBodyEle.find(
                        '#user-' + reqData.to_id);
                    addUserToTopOfConversation(reqData.to_id, toUserEle);
                    setOpenMsgInfoEvent();
                }
                let unreadMessageCount = getSelectedUserUnreadMsgCount(
                    reqData.to_id,
                );
                if (unreadMessageCount > 0) {
                    scrollToLastMessage();
                }
            },
            error: function (error) {
                reqData.reply_to = '';
                displayToastr('Error', 'error', error.responseJSON.message);
                console.log(error);
                $('#btnSend').removeClass('chat__area-send-btn--disable');
            },
        });
    };

    function addMessage (data) {
        let messageData = data;
        messageData.message = data.message.replace(/(<([^>]+)>)/ig, '');
        let currentTime = moment().tz(timeZone).format('hh:mma');
        if (isUTCTimezone == '1') {
            currentTime = getLocalDate(moment().utc());
        }
        messageData.time = currentTime;
        messageData.senderName = authUserName;
        messageData.senderImg = authImgURL;
        messageData.message = getMessageByItsTypeForChatList(
            messageData.message, 0);
        let randomMsgId = Math.floor(Math.random() * 6) + Date.now();
        messageData.randomMsgId = randomMsgId;

        if ($('.chat__text-preview').length > 0) {
            if ($('.chat__text-preview').find('emojine')) {
                let emojiText = $('.chat__text-preview').
                    find('.replay-message').html();
                messageData.replyMessage = emojiText;
            } else {
                messageData.replyMessage = $('.chat__text-preview').
                    find('.replay-message').
                    text();
            }
            messageData.receiverName = $('.chat__text-preview').
                find('.reply-to-user').
                text();
        } else {
            messageData.replyMessage = '';
            messageData.receiverName = '';
        }

        let template = $.templates('#tmplSingleMessage');
        let htmlOutput = template.render(messageData);
        let getLastTime = $('.chat__person-box--active').
            find('.chat__person-box-time').text();

        // Append today's timeline
        let todaysTimeLine = $.templates('#tmplToday');
        if (getLastTime == 'Yesterday' || moment(getLastTime).isValid()) {
            $('.chat__person-box--active').
                find('.chat__person-box-time').text(messageData.time);
            $('.chat-conversation').append(todaysTimeLine);
        } else if (!getLastTime) {
            $('.chat-conversation').append(todaysTimeLine);
            $('.chat__person-box--active').
                find('.chat__person-box-time').
                text(getLocalDate(moment().utc()));
        }

        $('.chat-conversation').append(htmlOutput);
        $('.chat__not-selected').hide();
        scrollToLastMessage();
        setOpenMsgInfoEvent();

        return randomMsgId;
    }

    window.getSelectedUserUnreadMsgCount = function (userId) {
        return $('#user-' + userId).find('.chat__person-box-count').text();
    };

    window.setSentOrReceivedMessage = function (message) {
        let recentChatMessage = prepareChatConversation(message, false);

        let chatConversationEle = $('.chat-conversation');
        let needToScroll = false;
        displaySideMedia(message);

        if (message.from_id == loggedInUserId) {
            //at sender side
            if (isAllMessagesRead) {
                chatConversationEle.append(recentChatMessage);
            }
            scrollToLastMessage();
        } else {
            if (isAllMessagesRead || appendGroupMessagesAtLast) {
                let needToScrollCondition = add(chatConversationEle.scrollTop(),
                    chatConversationEle.innerHeight()) >=
                    chatConversationEle[0].scrollHeight;
                needToScroll = needToScrollCondition ? true : false;
                chatConversationEle.append(recentChatMessage);
                if (needToScroll) {
                    scrollToLastMessage();
                    // fireReadMessageEvent([message]);
                } else {
                    let unreadMessageCountEle = $(
                        '#user-' + latestSelectedUser).
                        find('.chat__person-box-count');
                    let unreadMessageCount = unreadMessageCountEle.text();
                    unreadMessageCount = add(unreadMessageCount, 1);
                    unreadMessageCountEle.text(unreadMessageCount);
                    unreadMessageCountEle.removeClass('d-none');
                    let newMsgBadge = chatConversationEle.find(
                        '.chat__msg-day-new-msg');
                    if (newMsgBadge.length === 0) {
                        let firstUnreadEle = $('.message-' + message.id);
                        firstUnreadEle.before(newMessageIndicator);
                    }
                }
            }
        }

        $('.chat__not-selected').hide();
        noConversationEle.hide();

        updateMessageInSenderwindow(message);

        if (!message.is_group) {
            //update in reciever's conversation
            let userEle = chatPeopleBodyEle.find('#user-' + message.from_id);
            userEle.find('.chat-message').
                html(getMessageByItsTypeForChatList(message.message,
                    message.message_type, message.file_name));
            userEle.find('.chat__person-box-time').
                text(getLocalDate(message.created_at));
        }

        loadTooltip();
    };

    window.updateMessageInSenderwindow = function (message) {
        //update in logged in user's conversation
        let userEle = chatPeopleBodyEle.find('#user-' + message.to_id);
        userEle.find('.chat-message').
            html(getMessageByItsTypeForChatList(message.message,
                message.message_type, message.file_name));
        userEle.find('.chat__person-box-time').
            text(getLocalDate(message.created_at));
    };

    function resetForm () {
        textMessageEle[0].emojioneArea.setText('');
    }

    function add (num1, num2) {
        return parseInt(num1) + parseInt(num2);
    }

    function messageReadAfter5Seconds () {
        let newIds = [];
        // prepare unique array of unread messages
        $.each(unreadMessageIds, function (i, v) {
            if ($.inArray(v, newIds) === -1 &&
                $.inArray(v, readedMessageIds) === -1) {
                newIds.push(v);
            }
        });

        readedMessageIds = $.merge(readedMessageIds, newIds);

        if (newIds.length <= 0) {
            return;
        }

        let isGroup = $('.chat__person-box--active').data('is_group');
        let groupId = (isGroup)
            ? $('.chat__person-box--active').data('id')
            : '';
        unreadMessageIds = []; // make unread message ids empty
        let senderId = $('.chat__person-box--active').data('id');

        $.ajax({
            type: 'post',
            url: readMessageURL,
            data: {
                ids: newIds,
                '_token': csrfToken,
                'is_group': isGroup,
                'group_id': groupId,
            },
            success: function (data) {
                $.each(newIds, function (index, value) {
                    $('.message-' + value).removeClass('unread');
                });
                if (data.success == true) {
                    let remainingUnread = data.data.remainingUnread;

                    // TODO: do not update unread messages count when chat window is  open
                    let UnreadCountEle = $('#user-' + senderId).
                        find('.chat__person-box-count');
                    UnreadCountEle.text(remainingUnread);

                    if (remainingUnread > 0) {
                        isAllMessagesRead = false;
                        // TODO : do not scroll again and again
                        // Scroll to minor top from bottom so don't need to again scroll bottom for load new messages
                        // $('.chat-conversation').scrollTop(
                        //     $('.chat-conversation').scrollTop() - 100);
                    } else {
                        UnreadCountEle.text(0).addClass('d-none');
                        setTimeout(function () {
                            $('.chat__msg-day-new-msg').parent().remove();
                        }, 20000);
                        scrollAtLastMsg = false;
                        isAllMessagesRead = true;
                    }
                }
            },
        });
    }

    window.getUnreadMessageIds = function (conversations) {
        let ids = [];
        $.each(conversations, function (index, conversation) {
            if (conversation.to_id == loggedInUserId && !conversation.status) {
                ids.push(conversation.id);
            }
        });

        return ids;
    };

    window.getUnreadGroupMessageIds = function (conversations, limit = 10) {
        let ids = [];
        let count = 1;
        if (conversations.length > limit) {
            return ids;
        }

        $.each(conversations, function (index, conversation) {
            if (count <= limit &&
                $('.message-' + conversation.id).hasClass('unread')) {
                ids.push(conversation.id);
            }
            count += 1;
        });

        return ids;
    };

    window.fireReadMessageEvent = function (conversations) {
        let unreadMessageIds = getUnreadMessageIds(conversations);
        fireReadMessageEventUsingIds(unreadMessageIds);
    };

    window.fireReadMessageEventUsingIds = function (ids) {
        if (ids.length > 0) {
            // Store unread message ids into global variables
            unreadMessageIds = $.merge(unreadMessageIds, ids);

            // Now call the read message looping function which will check unread message at each 5 seconds
            if (!readMessageFunctionInterval) {
                let interval = setInterval(messageReadAfter5Seconds, 5000); // readMessageFunctionInterval = true;
                readMessageFunctionInterval = true;
            }
        } else {
            isAllMessagesRead = true;
        }
    };

    window.getMessageByItsTypeForChatList = function (
        message, message_type, file_name = '') {
        if (message_type === mediaTypeImage) {
            return '<i class="fa fa-camera" aria-hidden="true"></i>' + ' Photo';
        } else if (message_type === mediaTypePdf) {
            return '<i class="fa fa-file-pdf-o" aria-hidden="true"></i>' + ' ' +
                file_name;
        } else if (message_type === mediaTypeDocx) {
            return '<i class="fa fa-file-word-o" aria-hidden="true"></i>' +
                ' ' + file_name;
        } else if (message_type === mediaTypeVoice) {
            return '<i class="fa fa-file-audio-o" aria-hidden="true"></i>' +
                ' ' + file_name;
        } else if (message_type === mediaTypeVideo) {
            return '<i class="fa fa-file-video-o" aria-hidden="true"></i>' +
                ' ' + file_name;
        } else if (message_type === mediaTypeTxt) {
            return '<i class="fa fa-file-text-o" aria-hidden="true"></i>' +
                ' ' + file_name;
        } else if (message_type === mediaTypeXls) {
            return '<i class="fa fa-file-excel-o" aria-hidden="true"></i>' +
                ' ' + file_name;
        } else {
            return emojione.shortnameToImage(message);
        }
    };

    window.checkUserStatus = function (contactDetail) {
        return (contactDetail.hasOwnProperty('user_status') &&
            contactDetail.user_status != null) ? true : false;
    };

    window.checkUserStatusForGroupMember = function (userStatus) {
        return (userStatus != null) ? true : false;
    };
    
    window.getDraftMessage = function (contactId) {
        let lastDraftMsg = getLocalStorageItem('user_' + contactId);
        
        return (lastDraftMsg != null) ? '<i class="fa fa-pencil" aria-hidden="true"></i> ' + getMessageByItsTypeForChatList(lastDraftMsg, 0) : false;
    };

    window.prepareContacts = function (contact) {
        let contactDetail = (contact.is_group) ? contact.group : contact.user;
        let contactId = (contact.is_group) ? contact.group_id : contact.user_id;
        let showStatus = true;
        let showUserStatus = false;

        if (contact.is_group && contactDetail.removed_from_group) {
            contactDetail = contact.group_details;
        }

        if (($.inArray(contactId.toString(), myContactIds) != -1)) {
            showUserStatus = true;
        }

        if (($.inArray(contactId, blockedUsersList) != -1) ||
            contact.is_group) {
            showStatus = false;
            showUserStatus = false;
        }

        let template = $.templates('#tmplConversationsList');
        let helpers = {
            getMessageByItsTypeForChatList: getMessageByItsTypeForChatList,
            getLocalDate: getLocalDate,
            checkUserStatus: checkUserStatus,
            checkForMyContact: checkForMyContact,
            getDraftMessage: getDraftMessage,
        };

        let data = {
            showStatus: showStatus,
            showUserStatus: showUserStatus,
            contactId: contactId,
            contact: contact,
            contactDetail: contactDetail,
            is_online: (!contact.is_group) ? contact.user.is_online : 0,
        };
        let contactElementHtml = template.render(data, helpers);

        if (contact.unread_count > 0) {
            totalUnreadConversations += 1;
            updateUnreadMessageCount(0);
        }

        return contactElementHtml;
    };

    //add latest messaged user to top of conversation
    window.addUserToTopOfConversation = function (userId, userEle) {
        chatPeopleBodyEle.remove('#user-' + userId);
        chatPeopleBodyEle.prepend(userEle);
    };

    window.Echo.private(`user.${loggedInUserId}`).
        listen('UserEvent', (e) => {
            if (e.type === 1) { // block-unblock user event
                blockUnblockUserEvent(e);
            } else if (e.type === 2) { // new user-to-user message arrived
                newMessageArrived(e);
            } else if (e.type === 3) { // added to group
                prepareNewGroupChatConversation(e);
            } else if (e.type === 4) { // private message read
                privateMessageReadByUser(e);
            } else if (e.type === 5) { // message deleted for everyone
                messageDeletedForEveryone(e);
            } else if (e.type === 6 && (getCurrentUserId() === e.owner_id)) {
                readNotificationWhenChatWindowOpen(e.id,
                    '#owner-' + e.owner_id);
            } else if (e.type === 7) {
                //chat request arrive
                if (!checkIsMyContact(e)) {
                    return false;
                }
                newMessageArrived(e);
            } else if (e.type === 8) {
                //chat request acceped
                myContactIds.push(e.owner_id);
                updateMyContactWhenChatReqAccepted(e.owner_id);
                if (getCurrentUserId() == e.owner_id) {
                    $('#user-' + getCurrentUserId()).trigger('click');
                }
            }
        });

    window.updateMyContactWhenChatReqAccepted = function (userId) {
        $('#chatPeopleBody').
            find('#user-' + userId).
            attr('data-is_my_contact', 1);
    };

    window.checkIsMyContact = function (messageData) {
        if (messageData.is_group == 1) {
            return true;
        }
        let userEle = $('#user-' + selectedContactId);
        if (userEle.length > 0) {
            let isMyContact = userEle.attr('data-is_my_contact');
            return (isMyContact == '1') ? true : false;
        }
        return true;
    };

    function messageDeletedForEveryone (e) {
        let messageEle = $('.message-' + e.id);
        removeTimeline(messageEle);
        updateMessageOnReceiverDrawer(e.previousMessage, messageEle, e);

        if (chatPeopleBodyEle.find('#user-' + e.from_id).length) {
            // if chat window is open
            $('.message-' + e.id).remove();
        }
    }

    function updateMessageOnReceiverDrawer (previousMessage, messageEle, delMsgInfo) {
        let userEle = $(document).find('#user-' + delMsgInfo.from_id);
        if (previousMessage != null && messageEle.nextAll(
            '#send-receive-direction:first').length === 0) {
            let chatPersonBox = userEle;
            let oldMsgCount = userEle.find('.chat__person-box-count').text();
            oldMsgCount = parseInt(oldMsgCount);

            if (oldMsgCount > 1) {
                let msgCount = oldMsgCount - 1;
                chatPersonBox.find('.chat__person-box-count').html(msgCount);
            } else {
                chatPersonBox.find('.chat__person-box-count').html(0).removeClass('d-none').addClass('d-none');
            }

            chatPersonBox.find('.chat-message').
                html(getMessageByItsTypeForChatList(
                    previousMessage.message,
                    previousMessage.message_type,
                    previousMessage.file_name));
            chatPersonBox.find('.chat__person-box-time').
                text(getLocalDate(previousMessage.created_at));
        }
        else if (delMsgInfo.previousMessage == null && userEle.length > 0) {
            userEle.find('.chat-message').html('');
            userEle.find('.chat__person-box-count').text(0).addClass('d-none');
        }
        checkAllMsgAndShowNoMsgYet();
    }

    function privateMessageReadByUser (e) {

        let readClass = 'chat-container__read-status--read';
        let unreadClass = 'chat-container__read-status--unread';
        $.each(e.ids, function (i, v) {
            $('.message-' + v).
                find('.chat-container__read-status').
                removeClass(unreadClass).
                addClass(readClass);

            updateReadMessageInfo(v, e.user_id);
        });
    }
    
    window.updateReadMessageInfo = function(messageId, userId) {
        if (selectedContactId != userId) {
            return false;
        }
        $.each(conversationMessages, function (index, messageInfo) {
            if (messageInfo.id == messageId) {
                messageInfo.status = 1;
                messageInfo.updated_at = moment.utc().format('YYYY-MM-DD hh:mm:ss');
                let messageReadAtEle = $("#msg-read-at-"+messageId);
                if (messageReadAtEle.length > 0) {
                    messageReadAtEle.text(getCalenderFormatForLastSeen(messageInfo.updated_at));
                }
                return false;
            }
        });
    };

    function blockUnblockUserEvent (e) {
        let currentUserId = $('.chat__person-box--active').data('id');
        if (loggedInUserId != e.blockedTo.id) {
            return;
        }

        if (!e.isBlocked && currentUserId == e.blockedBy.id) {
            $('.typing').show();
            $('#user-' + currentUserId).
                find('.chat__person-box-status').
                show();
            $('.chat-profile__person-status').show();
            $('.chat__area-wrapper').append(chatSendArea);
            $('.hdn-text-message').remove();
            $('.blocked-message-text').remove();
            loadEojiArea();
            sendMessage();
            removeValueFromArray(blockedUsersList, currentUserId);
        } else if (e.isBlocked) {
            if (currentUserId == e.blockedBy.id) {
                $('.chat__area-text').remove();
                $('.blocked-message-text').remove();
                $('.typing').hide();
                $('.chat__area-wrapper').
                    append(blockedByMessageText);
            }

            $('#user-' + currentUserId).
                find('.chat__person-box-status').
                hide();
            $('.chat-profile__person-status').hide();
            blockedUsersList.push(e.blockedBy.id);
        }
    }

    function newMessageArrived (e) {
        let isArchiveChat = archivePeopleBodyEle.find(
            '#user-' + e.from_id).length;
        if ($.inArray(selectedContactId, [e.from_id, e.to_id]) >= 0) {
            callAfterAPI = false;
            moveConversationFromArchiveToActiveChat();
            //already chat window is open whoes message has arrive
            setSentOrReceivedMessage(e);
            let fromUser = chatPeopleBodyEle.find('#user-' + e.from_id);
            let toUser = chatPeopleBodyEle.find('#user-' + e.to_id);
            if (fromUser.length) {
                addUserToTopOfConversation(e.from_id, fromUser);
            } else if (toUser.length) {
                addUserToTopOfConversation(e.to_id, toUser);
            }
            moveConversationFromArchiveToActiveChat();
        } else if (chatPeopleBodyEle.find('#user-' + e.from_id).length) {
            //chat window is not open so update message count
            let userEle = chatPeopleBodyEle.find('#user-' + e.from_id);
            let oldMsgCount = userEle.find('.chat__person-box-count').
                text();
            oldMsgCount = (isNaN(oldMsgCount) || oldMsgCount === '')
                ? 0
                : oldMsgCount;
            if (oldMsgCount == 0) {
                totalUnreadConversations += 1;
                updateUnreadMessageCount(0);
            }
            let newMsgCount = add(oldMsgCount, 1);
            userEle.find('.chat__person-box-count').removeClass('d-none');
            userEle.find('.chat__person-box-count').
                text(newMsgCount).
                show();
            userEle.find('.chat-message').
                html(getMessageByItsTypeForChatList(e.message,
                    e.message_type, e.file_name));
            userEle.find('.chat__person-box-time').
                text(getLocalDate(e.created_at));
            addUserToTopOfConversation(e.from_id, userEle);
        } else {
            totalUnreadConversations += 1;
            updateUnreadMessageCount(0);
            //user not exist in chat-list so start new conversation
            let newUserEle = prepareNewConversation(e.from_id,
                htmlSpecialCharsDecode(e.sender.name), e,
                e.sender.photo_url);
            chatPeopleBodyEle.prepend(newUserEle);
            let userEle = chatPeopleBodyEle.find('#user-' + e.from_id);
            userEle.find('.chat__person-box-status').
                removeClass('chat__person-box-status--offline').
                addClass('chat__person-box-status--online');
            noConversationEle.hide();
            archivePeopleBodyEle.find('#user-' + e.from_id).remove();
        }
        if (isArchiveChat) {
            makeConversationArchiveWhenMessageArrive(e.from_id);
            makeActiveChatTabActive();
            showNoArchiveConversationEle();
        }
    }

    window.makeConversationArchiveWhenMessageArrive = function (userId) {
        $.ajax({
            type: 'get',
            url: deleteConversationUrl + userId + '/archive-chat',
            success: function () {
                showNoArchiveConversationEle();
            },
        });
    };

    window.Echo.private(`chat`).
        listenForWhisper(`start-typing.${loggedInUserId}`, (e) => {
            if (latestSelectedUser == e.user.id) {
                let userTyping = e.user.name + ' Typing...';
                $('.typing').html(userTyping).show();
            }
        }).listenForWhisper(`stop-typing.${loggedInUserId}`, (e) => {
        if (latestSelectedUser == e.user.id) {
            $('.typing').html('online').show();
        }
    });

    function listenForGroupMessageTyping (groupId) {
        window.Echo.private(`group.${groupId}`).
            listenForWhisper(`group-message-typing`, (e) => {
                var userTyping = e.data.name + ' Typing...';
                let currentGroupId = $('.chat__person-box--active').data('id');
                if (currentGroupId != e.data.groupId) {
                    return;
                }

                $('.typing').removeClass('d-none');
                $('.typing').html(userTyping).show();
            }).listenForWhisper(`stop-group-message-typing`, (e) => {
            let currentGroupId = $('.chat__person-box--active').data('id');
            if (currentGroupId != e.data.groupId) {
                return;
            }

            $('.typing').hide();
        });
    }

    Echo.join(`user-status`).here((users) => {
        setTimeout(function () {
            $.each(users, function (index, user) {
                updateUserStatus(user, 1);
            });
        }, 1000);
    }).joining((user) => {
        updateUserStatus(user, 1);
    }).leaving((user) => {
        updateUserStatus(user, 0);
    });

    window.prepareChatHeader = function (user, conversations) {
        let lastSeenTime = (user.last_seen !== null && user.last_seen != '')
            ? getCalenderFormatForLastSeen(user.last_seen)
            : 'Never';
        /** If user is blocked then do not show last seen */
        let isGroup = $('.chat__person-box--active').data('is_group');

        let template = $.templates('#tmplConversation');
        var $htmlOutput = $(template.render({
            user: user,
            lastSeenTime: lastSeenTime,
            isGroup: isGroup,
        }, { checkUserStatus: checkUserStatus }));

        let messageConversation = $htmlOutput.find('.chat-conversation');
        messageConversation.html('');
        if (conversations.length !== null) {
            messageConversation.html(
                conversations.map(prepareChatConversation).join(''));
        }

        return $htmlOutput.html();
    };

    window.prepareChatConversation = function (
        data, needToRemoveOldTimeline = true) {
        if (data.message_type === 9) {
            let timeLineEle = addTimeLineEle(
                data.created_at,
                needToRemoveOldTimeline,
            );

            let template = $.templates('#tmplMessageBadges');
            let helpers = { getLocalDate: getLocalDate };
            return timeLineEle + template.render(data, helpers);
        }

        if ($.inArray(needToRemoveOldTimeline, [true, false]) === -1) {
            needToRemoveOldTimeline = true;
        }

        let timeLineEle = addTimeLineEle(
            data.created_at,
            needToRemoveOldTimeline,
        );

        let isReceiver = false;
        let className = (data.from_id == loggedInUserId)
            ? 'chat-conversation__sender'
            : (!data.status)
                ? 'chat-conversation__receiver unread'
                : 'chat-conversation__receiver';

        let readUnread = ((data.hasOwnProperty('is_group') &&
            data.is_group === 0 && data.status == 1) ||
            (data.hasOwnProperty('read_by_all_count') &&
                data.read_by_all_count === 0))
            ? 'chat-container__read-status--read'
            : 'chat-container__read-status--unread';

        if (className.includes('chat-conversation__receiver')) {
            isReceiver = true;
        }

        let allowToDelete = true;
        let deleteMsgForEveryone = true;
        if (data.time_from_now_in_min > messageDeleteTime) {
            allowToDelete = false;
        }

        if (data.time_from_now_in_min > deleteMsgForEveryone) {
            deleteMsgForEveryone = false;
        }

        let templateData = {};
        let helpers = {
            displayMessage: displayMessage,
            getChatMagTimeInConversation: getChatMagTimeInConversation,
        };
        let template = $.templates('#tmplMessage');
        templateData.data = data;
        templateData.isReceiver = isReceiver;
        templateData.loggedInUserId = loggedInUserId;
        templateData.authImage = $.parseHTML(authImgURL)[0].data;
        templateData.authUserName = authUserName;
        templateData.needToRemoveOldTimeline = needToRemoveOldTimeline;
        templateData.className = className;
        templateData.readUnread = readUnread;
        templateData.allowToDelete = allowToDelete;
        templateData.deleteMsgForEveryone = deleteMsgForEveryone;

        return timeLineEle + template.render(templateData, helpers);
    };

    window.displayMessage = function (data) {
        if (data.message_type === mediaTypeImage) {
            return imageRenderer(data.message);
        } else if (data.message_type === mediaTypePdf) {
            return fileRenderer(data.message, data.file_name, pdfURL);
        } else if (data.message_type === mediaTypeDocx) {
            return fileRenderer(data.message, data.file_name, docsURL);
        } else if (data.message_type === mediaTypeVideo) {
            return videoRenderer(data.message);
        } else if (data.message_type === youtubeUrl) {
            return renderYoutubeURL(data.message);
        } else if (data.message_type === mediaTypeTxt) {
            return fileRenderer(data.message, data.file_name, textURL);
        } else if (data.message_type === mediaTypeXls) {
            return fileRenderer(data.message, data.file_name,
                xlsURL);
        } else if (data.message_type === mediaTypeVoice) {
            return voiceRenderer(data.message, data.file_name);
        } else {
            if (checkYoutubeUrl(data.message) === youtubeUrl) {
                return renderMultipleYouTubeUrl(data);
            }
            if (data.url_details) {
                let records = {
                    urlDetails: data.url_details,
                    message: data.message,
                };
                return $.templates('#tmplLinkPreview').render(records);
            }

            return emojione.shortnameToImage(
                detectUrlFromTextMessage(data.message));
        }
    };

    window.checkYoutubeUrl = function (message) {
        let youtubeLink = 'youtube.com/watch?v=';
        if (message.indexOf(youtubeLink) != -1) {
            return youtubeUrl;
        }
        return 0;
    };

    window.findUrls = function (text) {
        let source = (text || '').toString();
        let urlArray = [];
        let matchArray;

        // Regular expression to find FTP, HTTP(S) and email URLs.
        let regexToken = /(((ftp|https?):\/\/)[\-\w@:%_\+.~#?,&\/\/=]+)|((mailto:)?[_.\w-]+@([\w][\w\-]+\.)+[a-zA-Z]{2,3})/g;

        // Iterate through any URLs in the text.
        while ((matchArray = regexToken.exec(source)) !== null) {
            let token = matchArray[0];
            urlArray.push(token);
        }

        return urlArray;
    };

    window.renderMultipleYouTubeUrl = function (data) {
        let messageClassName = (data.from_id != loggedInUserId)
            ? 'float-right'
            : 'float-left';
        let rendererClassName = (data.from_id != loggedInUserId)
            ? 'mr-2'
            : 'float-right ml-2';
        let urls = findUrls(data.message);
        let message = '';
        $.each(urls, (index, url) => {
            message += renderYoutubeURL(url, rendererClassName);
        });
        return message +
            '<div class="d-inline-block ' + messageClassName +
            ' mx-1" style="max-width: 500px;">' +
            data.message +
            '</div>';
    };

    window.addTimeLineEle = function (
        created_at, needToRemoveOldTimeline = true) {
        let timelineDate = getCalenderFormatForTimeLine(created_at);
        let timelineDateClass = (timelineDate.split(' ')).join('_').
            replace(',', '');
        let timeLineEle = '';
        let timeLineEleContent = '<div class="chat__msg-day-divider d-flex justify-content-center ' +
            timelineDateClass + '">\n' +
            '               <span class="chat__msg-day-title">' + timelineDate +
            '</span>\n' +
            '          </div>';

        if (timelineDate == 'Today' &&
            $('.chat-conversation').find($('.chat__msg-day-title')).text() ==
            'Today') {
            return '';
        }

        if ($.inArray(timelineDate, previousDate) === -1) {
            //only new timeline will be added
            timeLineEle = timeLineEleContent;
            previousDate.push(timelineDate);
        } else if (needToRemoveOldTimeline) {
            //new timeline will be added and old will be REMOVED
            let oldTimeLineEle = $('.chat-conversation').
                find('.' + timelineDateClass);
            if (oldTimeLineEle.length) {
                $('.' + timelineDateClass).remove();
                timeLineEle = timeLineEleContent;
            }
        }
        return timeLineEle;
    };

    window.isTyping = function () {
        let channel = Echo.private(`chat`);
        let isGroup = $('.chat__person-box--active').data('is_group');
        if (isGroup) {
            groupChatTyping();
            return;
        }

        if (startTyping) {
            //fire start typing event
            channel.whisper(`start-typing.${latestSelectedUser}`, {
                user: { id: loggedInUserId, name: authUserName },
                typing: true,
            });
        }
        startTyping = false;
        clearTimeout(timer);
        timer = setTimeout(stopTyping, 1000);
    };

    window.groupChatTyping = function () {
        let groupId = $('.chat__person-box--active').data('id');
        let channel = Echo.private(`group.${groupId}`);

        //fire start typing event
        channel.whisper(`group-message-typing`, {
            data: { groupId: groupId, name: authUserName },
            typing: true,
        });

        setTimeout(stopGroupChatTyping, 1000);
    };

    window.stopGroupChatTyping = function () {
        let groupId = $('.chat__person-box--active').data('id');
        let channel = Echo.private(`group.${groupId}`);
        //fire stop typing event
        channel.whisper(`stop-group-message-typing`, {
            data: { groupId: groupId, name: authUserName },
            typing: true,
        });
    };

    window.stopTyping = function () {
        startTyping = true;
        let channel = Echo.private(`chat`);

        //fire stop typing event
        channel.whisper(`stop-typing.${latestSelectedUser}`, {
            user: { id: loggedInUserId },
            typing: true,
        });
    };

// user search event
    $(document).on('click', '.user-list-chat-select__list-item', function () {
        $('.user-list-chat-select .user-list-chat-select__list-item').
            removeClass('user-list-chat-select__list-item--active');
        $(this).addClass('user-list-chat-select__list-item--active');
        startNewConversation();
    });

    window.startNewConversation = function () {
        let selectedUserId = $(
            '.user-list-chat-select__list-item--active input')[0].value;
        let isMyContact = checkForMyContact(selectedUserId);
        let selectedUserProfilePicUrl = $(
            '.user-list-chat-select__list-item--active img').attr('src');
        let selectedUserName = $(
            '.user-list-chat-select__list-item--active .add-user-contact-name').
            text();
        $('#addNewChat').modal('toggle');
        var isUserElePresent = $('.chat__people-body').
            find('#user-' + selectedUserId).length;
        let isUserElePresentInArchiveChat = archivePeopleBodyEle.
            find('#user-' + selectedUserId).length;
        if (isUserElePresentInArchiveChat) {
            makeArchiveChatTabActive();
        } else {
            makeActiveChatTabActive();
        }
        let selectedUserStatus = $('.user-' + selectedUserId).data('status');
        let isGroup = $('.user-' + selectedUserId).data('is-group');
        if (!isUserElePresent) {
            let newUserEle = prepareNewConversation(
                selectedUserId,
                selectedUserName,
                '',
                selectedUserProfilePicUrl,
                selectedUserStatus,
                (isGroup) ? 1 : 0,
            );
            chatPeopleBodyEle.prepend(newUserEle);
        }
        $('#user-' + selectedUserId).trigger('click');
        $('#user-' + selectedUserId).attr('data-is_my_contact', isMyContact);
    };

    window.checkForMyContact = function (selectedContactId) {
        let inMyContacts = $.inArray(selectedContactId.toString(),
            myContactIds);
        return (inMyContacts > -1) ? 1 : 0;
    };

    window.prepareNewConversation = function (
        userId,
        name,
        messageInfo = '',
        profilePic,
        status = '',
        isGroup = 0,
    ) {
        let count = 0;
        if (messageInfo !== '') {
            status = messageInfo.sender.is_online;
            count = 1;
        }

        let template = $.templates('#tmplContact');
        let helpers = {
            getMessageByItsTypeForChatList: getMessageByItsTypeForChatList,
            getLocalDate: getLocalDate,
        };

        return template.render({
            id: userId,
            name: name,
            photo_url: profilePic,
            status: status,
            isGroup: isGroup,
            messageInfo: messageInfo,
            count: count,
        }, helpers);
    };

    window.makeUserOnlineOffline = function (ele, status) {
        if (status) {
            ele.find('.chat__person-box-status').
                removeClass('chat__person-box-status--offline').
                addClass('chat__person-box-status--online');
        } else {
            ele.find('.chat__person-box-status').
                removeClass('chat__person-box-status--online').
                addClass('chat__person-box-status--offline');
        }
    };
    
    window.searchMyContacts = function() {
        $('#searchMyContactForChat').val('').trigger('keyup');
        let searchMyContactsResult = [];
        let searchUserValue = document.getElementById('searchMyContactForChat');
        $(searchUserValue).on('keyup', function () {
            let filteredUsersList = myContactsFilter();
            searchMyContactsResult = [];
            let value = $(this).val().toLowerCase();
            filteredUsersList.filter(function () {
                $(this).toggle($(this).text().toLowerCase().indexOf(value) > -1);
                searchMyContactsResult.push($(this).text().toLowerCase().indexOf(value));
            });
            ifUserNotPresentShowNoRecordFound(searchMyContactsResult, 'no-my-contact');
        });
        searchEleSearchEvent($('#searchMyContactForChat'));
    };
    
    window.searchNewConversation = function() {
        // get search chat input value and filer user
        $('#searchContactForChat').val('').trigger('keyup');
        $('.user-list-chat-select .user-list-chat-select__list-item').
            removeClass('user-list-chat-select__list-item--active');

        let searchResult = [];
        let searchUserValue = document.getElementById('searchContactForChat');
        
        $(searchUserValue).on('keyup', function () {
            let selectedFilter = [];
            $.each($("input[name='new_contact_gender']:checked"), function(){
                selectedFilter.push($(this). val());
            });
            let filterClass = selectedFilter.length === 1 ? getGender(selectedFilter[0]) : null;
            let userListForChat = (filterClass !== null) ? $('#userListForChat').children('.'+filterClass) : $('#userListForChat li');
            
            searchResult = [];
            let value = $(this).val().toLowerCase();
            userListForChat.filter(function () {
                $(this).
                    toggle($(this).text().toLowerCase().indexOf(value) > -1);
                searchResult.push($(this).text().toLowerCase().indexOf(value));
            });
            ifUserNotPresentShowNoRecordFound(searchResult, 'no-user');
        });
        searchEleSearchEvent($('#searchContactForChat'));
    };

// getting data on modal for search user
    $('#addNewChat').on('show.bs.modal', function () {
        searchMyContacts();
        
        searchNewConversation();

        $('#searchGroupsForChat').val('').trigger('keyup');
        $('.user-list-chat-select .user-list-chat-select__list-item').
            removeClass('user-list-chat-select__list-item--active');
        // get search chat input value and filer user
        let groupSearchResult = [];
        let searchGroupValue = document.getElementById('searchGroupsForChat');

        $(searchGroupValue).on('keyup', function () {
            groupSearchResult = [];
            let value = $(this).val().toLowerCase();
            $('#groupListForChat li').filter(function () {
                $(this).
                    toggle($(this).text().toLowerCase().indexOf(value) > -1);
                groupSearchResult.push(
                    $(this).text().toLowerCase().indexOf(value));
            });
            ifUserNotPresentShowNoRecordFound(groupSearchResult, 'no-group');
        });
        searchEleSearchEvent($('#searchGroupsForChat'));
        searchEleSearchEvent($('#searchBlockUsers'));

        $("#newContactMale").prop("checked", false);
        $("#newContactFemale").prop("checked", false);
        $('input[type="checkbox"][name="my_contacts_filter"]').prop("checked", false);
        $('#userListForChat').children('li').removeAttr('style');
    });

    /** Search members in Add Group members modal */
    $('#searchMembersToAddInGroup').on('keyup', function () {
        customSearch(
            'searchMembersToAddInGroup',
            'groupMembersForChat',
            'add-user-contact-name',
            'no-group-members',
        );
    });

    /** Search members blocked users list */
    $('#searchBlockUsers').on('keyup', function () {
        customSearch(
            'searchBlockUsers',
            'blockedUsersList',
            'add-user-contact-name',
            'no-blocked-user',
            'No blocked users found...',
        );
    });

    window.customSearch = function (
        searchBoxId, ulId, liTextFieldClass, hideShowClass,
        noRecordsFoundText = null) {
        let filter, ul, li, txt, i, txtValue;
        let searchFound = false;
        filter = $('#' + searchBoxId).val().toLowerCase();
        ul = document.getElementById(
            ulId);
        li = ul.getElementsByTagName('li');
        for (i = 0; i < li.length; i++) {
            txt = li[i].getElementsByClassName(
                liTextFieldClass)[0];
            txtValue = txt.textContent || txt.innerText;
            if (txtValue.toLowerCase().indexOf(filter) >
                -1) {
                searchFound = true;
                li[i].style.display = '';
                li[i].classList.add('d-flex');
                $('.' + hideShowClass).hide();
            } else {
                li[i].style.display = 'none';
                li[i].classList.remove('d-flex');
                $('.' + hideShowClass).show();
                if (noRecordsFoundText) {
                    $('.' + hideShowClass).
                        find('span').
                        text(noRecordsFoundText);
                }
            }
        }

        if (searchFound) {
            $('.' + hideShowClass).hide();
        }
    };

    window.prepareContactForModal = function (users, addSingleUser = false) {
        let helpers = {
            getGender: getGender,
            checkUserStatusForGroupMember: checkUserStatusForGroupMember,
        };
        let template = $.templates('#tmplAddChatUsersList');
        let htmlOutput = template.render(users, helpers);

        if (addSingleUser) {
            $('#userListForChat').append(htmlOutput);
        } else {
            $('#userListForChat').html(htmlOutput);
        }
    };

    window.getGender = function (gender) {
        if (gender == 1) {
            return 'male';
        }
        if (gender == 2) {
            return 'female';
        }
        return '';
    };

    window.getOnOffClass = function (status) {
        if (status == 1) {
            return 'online';
        }
        return 'offline';
    };

    function showOneClass(userList, className) {
        userList.not('.' + className).hide();
    }
    
    $('input[type="checkbox"][name="new_contact_gender"]'). click(function() {
        let userListForChat = $('#userListForChat');
        let maleList = userListForChat.children('.male');
        let femaleList = userListForChat.children('.female');
        let selectedFilter = [];
        $.each($("input[name='new_contact_gender']:checked"), function(){
            selectedFilter.push($(this). val());
        });

        if (selectedFilter.length === 0 || selectedFilter.length === 2) {
            userListForChat.children().show();
            showNoConversationFound(userListForChat.children().length,
                '#userListForAddPeople .no-user');
            $('#searchContactForChat').trigger('keyup');
            return true;
        }

        $.each($("input[name='new_contact_gender']:checked"), function(){
            if ($(this).val() == 1) {
                showOneClass(userListForChat.children(), 'male');
                showNoConversationFound(maleList.length,
                    '#userListForAddPeople .no-user');
            }
            if ($(this).val() == 2) {
                showOneClass(userListForChat.children(), 'female');
                showNoConversationFound(femaleList.length,
                    '#userListForAddPeople .no-user');
            }
        });
        $('#searchContactForChat').trigger('keyup');
    });

    $('input[type="checkbox"][name="my_contacts_filter"]').click(function() {
        let myContactListForChat = $('#myContactListForChat');
        let filteredUsersList = myContactsFilter();
        myContactListForChat.children('li').hide();
        filteredUsersList.show();
        showNoConversationFound(filteredUsersList.children().length,
            '#myContactListForAddPeople .no-my-contact');
        $('#searchMyContactForChat').trigger('keyup');
    });
    
    window.myContactsFilter = function(){
        let myContactListForChat = $('#myContactListForChat');
        let selectedFilter = [];
        let filteredUsersList = myContactListForChat.children('li');
        $.each($("input[name='my_contacts_filter']:checked"), function(){
            selectedFilter.push($(this). val());
        });

        if (selectedFilter.length === 0 || selectedFilter.length === 4) {
            myContactListForChat.children().show();
            showNoConversationFound(myContactListForChat.children().length,
                '#myContactListForAddPeople .no-my-contact');
            return filteredUsersList;
        }
        
        let filterGenderClassNames = [];
        let filterOnOffClassNames = [];

        $.each($('input[name=\'my_contacts_filter\']:checked'), function () {
            if ($(this).is(':checked')) {
                if ($(this).val() == 1) {//online
                    filterGenderClassNames.push('.male');
                }
                if ($(this).val() == 2) {//online
                    filterGenderClassNames.push('.female');
                }
                if ($(this).val() == 3) {//online
                    filterOnOffClassNames.push('.online');
                }
                if ($(this).val() == 4) {//online
                    filterOnOffClassNames.push('.offline');
                }
            }
        });

        if(filterGenderClassNames.length == 1){
            filterGenderClassNames = filterGenderClassNames.join('');
            filteredUsersList = filteredUsersList.filter(filterGenderClassNames);
        }
        if(filterOnOffClassNames.length == 1){
            filterOnOffClassNames = filterOnOffClassNames.join('');
            filteredUsersList = filteredUsersList.filter(filterOnOffClassNames);
        }
        
        return filteredUsersList;
    };

    window.showNoConversationFound = function (listLength, className) {
        if (listLength > 0) {
            $(className).hide();
        } else {
            $(className).show();
        }
    };

    window.prepareBlockedUsers = function (users, addSingleUser = false) {
        $('.no-blocked-user').hide();
        let template = $.templates('#tmplBlockedUsers');
        let htmlOutput = template.render(users);
        if (addSingleUser) {
            $('#blockedUsersList').append(htmlOutput);
        } else {
            $('#blockedUsersList').html(htmlOutput);
        }
    };
    
    window.searchEleSearchEvent = function(searchEle) {
        searchEle.on('search', function(){
            if (!this.value){
                searchEle.trigger('keyup');
            }
        });
    };

    window.searchUsers = function () {
        let searchResult = [];
        let searchEle = $('#searchUserInput');
        searchEleSearchEvent(searchEle);
        searchEle.on('keyup', function () {
            searchResult = [];
            let value = $(this).val().toLowerCase();
            let activeNavTab = getActiveNavChatTabId();
            $('#'+activeNavTab + ' .chat__person-box').filter(function () {
                $(this).
                    toggle($(this).
                        find('.chat__person-box-name').
                        text().
                        toLowerCase().
                        indexOf(value) > -1);
                searchResult.push($(this).
                    find('.chat__person-box-name').
                    text().
                    toLowerCase().
                    indexOf(value));
            });
            if (activeNavTab === 'chatPeopleBody') {
                ifUserNotPresentShowNoRecordFound(searchResult,
                    'no-conversation');
            }
            if (activeNavTab === 'archivePeopleBody') {
                ifUserNotPresentShowNoRecordFound(searchResult,
                    'no-archive-conversation');
            }
        });
    };
    
    $(document).on('click', '#activeChatTab', function() {
        resetSearch();
    });
    
    $(document).on('click', '#archiveChatTab', function() {
        resetSearch();
    });
    
    window.resetSearch = function() {
        let searchEle = $('#searchUserInput').val('');
        searchEle.trigger('keyup');
    };
    
    window.getActiveNavChatTabId = function() {
        return $(".chat__tab-content").find('.active').attr('id');
    };

    window.removeValueFromArray = function (arr, arrValue) {
        for (var i = 0; i < arr.length; i++) {
            if (arr[i] === arrValue) {
                arr.splice(i, 1);
            }
        }

        return arr;
    };

    window.ifUserNotPresentShowNoRecordFound = function (
        searchResult, noConversationClassName) {
        let isUserPresent = false;
        $.each(searchResult, function (index, value) {
            if (value >= 0) {
                isUserPresent = true;
                return false;
            }
        });
        if (isUserPresent) {
            $('.' + noConversationClassName).hide();
            return false;
        } else {
            $('.' + noConversationClassName).show();
            return true;
        }
    };

    window.updateUserStatus = function (user, status) {
        //recent chat-list ele
        let UserEle = chatPeopleBodyEle.find('#user-' + user.id);
        //new conversation ele (in pop up)
        let newUserEle = $('.user-' + user.id);
        let newUserEleParent = $('.chat-user-' + user.id);

        /** Do not show user status when user is blocked */
        if ($.inArray(user.id, blockedUsersList) != -1) {
            return;
        }

        if (status == 1) {
            UserEle.find('.chat__person-box-status').
                removeClass('chat__person-box-status--offline').
                addClass('chat__person-box-status--online');

            //conversation
            if ($('#toId').val() == user.id) {
                $('.typing').html('online');

                //user profile
                $('.chat-profile__person-status').show().text('online');
                $('.chat-profile__person-last-seen').hide();
            }

            newUserEle.find('.chat__person-box-status').
                removeClass('chat__person-box-status--offline').
                addClass('chat__person-box-status--online');
            newUserEle.attr('data-status', 1);
            newUserEleParent.removeClass('online').removeClass('offline').addClass('online');
        } else {
            UserEle.find('.chat__person-box-status').
                removeClass('chat__person-box-status--online').
                addClass('chat__person-box-status--offline');
            newUserEle.find('.chat__person-box-status').
                removeClass('chat__person-box-status--online').
                addClass('chat__person-box-status--offline');
            newUserEle.attr('data-status', 0);
            newUserEleParent.removeClass('online').removeClass('offline').addClass('offline');

            let last_seen = 'last seen at: ' +
                getCalenderFormatForLastSeen(Date(), 'hh:mma', 0);
            $('.typing').html(last_seen);

            let isGroup = $('.chat__person-box--active').data('is_group');
            if (isGroup) {
                return;
            }
            //user profile
            $('.chat-profile__person-last-seen').show().text(last_seen);
            $('.chat-profile__person-status').hide();
        }
    };

    window.getMessageByScroll = function (isGroup) {
        // let isGroup = $('.chat__person-box--active').data('is_group');
        $('.chat-conversation').on('scroll', function () {
            if ($(this).scrollTop() === 0) {
                shouldCallApiTop = (callBeforeAPI) ? true : false;
                if (shouldCallApiTop === true) {
                    let isGroup = $('.chat__person-box--active').
                        data('is_group');
                    let reqData = {
                        'before': lastMessageIdForScroll,
                        'is_group': isGroup,
                        // 'limit': limit,
                    };
                    getOldOrNewConversation(reqData, 1, 0);
                }
            } else if ($(this).scrollTop() + $(this).innerHeight() >=
                $(this)[0].scrollHeight) {
                let unreadIds = [];
                $('.chat-conversation .unread').each(function () {
                    unreadIds.push($(this).data('message_id'));
                });
                if (unreadIds.length > 0) {
                    fireReadMessageEventUsingIds(unreadIds);
                }

                let messageCount = $('.chat__person-box--active').
                    find('.chat__person-box-count').
                    text();
                messageCount = (isNaN(messageCount) || messageCount === '')
                    ? 0
                    : messageCount;

                if (messageCount > 0) {
                    // callAfterAPI = false, means do not load after messages when read time messages are incoming
                    shouldCallApiBottom = (callAfterAPI) ? true : false;
                }

                if (shouldCallApiBottom === true) {
                    let lastMessageIdForScrollBottom = $('.chat-conversation').
                        children().
                        last().
                        attr('data-message_id');

                    let anyNewMessages = $(
                        '.message-' + lastMessageIdForScrollBottom).next();

                    if (anyNewMessages.length > 0) {
                        return;
                    }
                    callAfterAPI = false;
                    let isGroup = $('.chat__person-box--active').
                        data('is_group');
                    let reqData = {
                        'after': lastMessageIdForScrollBottom,
                        'is_group': isGroup,
                        // 'limit': limit,
                    };
                    getOldOrNewConversation(reqData, 0, 1);
                }
            }
        });
    };

    window.getOldOrNewConversation = function (reqData, isBefore, isAfter) {
        let isGroup = $('.chat__person-box--active').data('is_group');
        $('.loading-message').removeClass('d-none');
        let urlDetail = userURL + selectedContactId + '/conversation';

        $.ajax({
            type: 'GET',
            url: urlDetail,
            data: reqData,
            success: function (data) {
                let userOrGroupObj = (isGroup)
                    ? data.data.group
                    : data.data.user;
                if (data.success && latestSelectedUser === userOrGroupObj.id) {
                    let conversations = data.data.conversations;
                    $.merge(conversationMessages, conversations)
                    if (conversations.length > 0) {
                        if (isBefore) {
                            let lastMsg = data.data.conversations[data.data.conversations.length -
                            1];
                            lastMessageIdForScroll = lastMsg.id;
                            $.each(conversations,
                                function (index, conversation) {
                                    $('.chat-conversation').
                                        prepend(prepareChatConversation(
                                            conversation));
                                });

                            let scrolledAtEle = $('.message-' + reqData.before);
                            scrollAtEle(scrolledAtEle);
                            setOpenMsgInfoEvent();
                        }
                        if (isAfter) {
                            $.each(conversations,
                                function (index, conversation) {
                                    $('.chat-conversation').
                                        append(prepareChatConversation(
                                            conversation, false));
                                });
                            setOpenMsgInfoEvent();
                            fireReadMessageEvent(conversations);
                        }
                    } else {
                        if (isBefore) {
                            shouldCallApiTop = false;
                        }
                        if (isAfter) {
                            shouldCallApiBottom = false;
                        }
                    }
                    if (scrollAtLastMsg && isAfter) {
                        scrollToLastMessage();
                    }
                    $('.loading-message').addClass('d-none');
                }
            },
            error: function (error) {
                console.log(error);
            },
        });
    };

    window.imageRenderer = function (message) {
        return `<a href="${message}" data-fancybox="gallery" data-toggle="lightbox" data-gallery="example-gallery" data-src="${message}"><img src="${message}"></a>`;
    };

    window.pdfRenderer = function (message, fileName) {
        return `<div class="media-wrapper d-flex align-items-center"><i class="fa fa-file-pdf-o" aria-hidden="true"></i><a href= "${message}"  target="blank" class="item"> ${fileName}</a></div>`;
    };

    window.voiceRenderer = function (message, fileName) {
        return `<div class="media-wrapper d-flex align-items-center p-0"><audio controls><source src="${message}" type="audio/mp3">
            Your browser does not support the audio element.
        </audio></div>`;
    };

    window.docRenderer = function (message, fileName) {
        return `<div class="media-wrapper d-flex align-items-center"><i class="fa fa-file-word-o" aria-hidden="true"></i><a href="${message}" 
    target="_blank">${fileName}</a></div>`;
    };

    window.txtRenderer = function (message, fileName) {
        return `<div class="media-wrapper d-flex align-items-center"><i class="fa fa-file-text-o" aria-hidden="true"></i><a href="${message}" 
    target="_blank">${fileName}</a></div>`;
    };

    window.xlsRenderer = function (message, fileName) {
        return `<div class="media-wrapper d-flex align-items-center"><img class="chat-file-preview" src="${xlsURL}" /><a href="${message}" 
    target="_blank">${fileName}</a></div>`;
    };

    window.fileRenderer = function (message, fileName, fileIcon) {

        if (fileIcon) {
            return `<div class="media-wrapper d-flex align-items-center"><img class="chat-file-preview" src="${fileIcon}" /><a href= "${message}"  target="blank" class="item"> ${fileName}</a></div>`;
        }

        return `<div class="media-wrapper d-flex align-items-center"><i class="fa ${fileIcon}" aria-hidden="true"></i><a href= "${message}"  target="blank" class="item"> ${fileName}</a></div>`;
    };

    window.videoRenderer = function (message) {
        return `<div class="chat-media">
                     <video id="my-video" class="video-js" controls preload="auto" width="640" height="264" data-setup=''>
                            <source src="${message}" type="video/mp4">
                            <source src="${message}" type="video/webm">
                            <p class="vjs-no-js">
                                To view this video please enable JavaScript, and consider upgrading to a web browser that
                                <a href="https://videojs.com/html5-video-support/" target="_blank">supports HTML5 video</a>
                            </p>
                      </video>
                </div>`;
    };

    window.renderYoutubeURL = function (url, redererClassName = '') {
        let newUrl = getYoutubeEmbedURL(url);
        return `<iframe width="246" height="246" style="border-radius:8px;" class="` +
            redererClassName + `" src="${newUrl}" frameborder="0" allow="accelerometer; autoplay; encrypted-media; gyroscope; picture-in-picture" allowfullscreen>
            </iframe>`;
    };

    window.getYoutubeEmbedURL = function (url) {
        let newUrl = url;
        let regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=)([^#\&\?]*).*/;
        let match = url.match(regExp);
        if (match && match[2].length === 11) {
            newUrl = 'https://www.youtube.com/embed/' + match[2] + '';
        }
        return newUrl;
    };

    window.format = function (dateTime, format = 'DD-MMM-YYYY') {
        return moment(dateTime).format(format);
    };

    window.imageRendererInSideMedia = function (message, id) {
        return `<a href="${message}" data-fancybox="gallery" data-toggle="media" data-gallery="media-gallery" data-src="${message}" id="mediaProfile-${id}"><img src="${message}"></a>`;
    };

    window.sideMediaRenderer = function (message, fileName, fileIcon, id) {
        return `<div class="media-wrapper d-flex align-items-center profile-media" id="mediaProfile-${id}" title="${fileName}" ><a href= "${message}" target="blank" class="item"> <i class="fa ${fileIcon}" aria-hidden="true" ></i></a></div>`;
    };

    window.getLocalDate = function (dateTime, format = 'hh:mma') {
        if (isUTCTimezone == '0'){
            return  moment(dateTime).format(format);
        }
        
        let date = moment(dateTime).utc(dateTime).local();
        return date.calendar(null, {
            sameDay: format,
            lastDay: '[Yesterday]',
            lastWeek: 'M/D/YY',
            sameElse: 'M/D/YY',
        });
    };

    window.getChatMagTimeInConversation = function (
        dateTime, format = 'h:mma') {

        if (isUTCTimezone == '0'){
            return  moment(dateTime).format(format);
        }
        
        return moment.utc(dateTime).local().format(format);
    };

    window.getCalenderFormatForLastSeen = function (
        dateTime, format = 'hh:mma', needToConvertLocalDate = 1) {
        let date = (needToConvertLocalDate) ? moment(dateTime).
            utc(dateTime).
            local() : moment(dateTime);
        return date.calendar(null, {
            sameDay: '[Today], ' + format,
            lastDay: '[Yesterday], ' + format,
            lastWeek: 'dddd, ' + format,
            sameElse: function () {
                if (moment().year() === moment(dateTime).year()) {
                    return 'MMM D, ' + format;
                } else {
                    return 'MMM D YYYY, ' + format;
                }
            },
        });
    };

    window.getCalenderFormatForTimeLine = function (dateTime) {
        return moment(dateTime).utc(dateTime).local().calendar(null, {
            sameDay: '[Today]',
            lastDay: '[Yesterday]',
            lastWeek: 'dddd, MMM Do',
            sameElse: function () {
                if (moment().year() === moment(dateTime).year()) {
                    return 'dddd, MMM Do';
                } else {
                    return 'dddd, MMM Do YYYY';
                }
            },
        });
    };

    window.addNoMessagesIndicator = function () {
        let noMsgTemplate = $.templates('#tmplNoMessagesYet');
        let htmlOutput = noMsgTemplate.render();
        $('#conversation-container').html(htmlOutput);
    };

    window.detectUrlFromTextMessage = function (message) {
        let regex = /((http|https|ftp):\/\/[a-zа-я0-9\w?=&.\/-;#~%-]+(?![a-zа-я0-9\w\s?&.\/;#~%"=-]*>))/g;
        // Replace plain text links by hyperlinks
        return message.replace(regex,
            '<a href=\'$1\' target=\'_blank\'>$1</a>');
    };

    window.addNoConversationIndicator = function () {
        let noConversationYet = $.templates('#tmplConversationYet');
        let htmlOutput = noConversationYet.render();

        $('.chat__area-wrapper').html(htmlOutput);
    };

    window.fireSwal = function (
        icon = 'success', title = 'Deleted!',
        text = 'Message has been deleted!', confirmButtonColor = '#20a8d8',
        timer = 2000) {
        Swal.fire({
            icon: icon,
            title: title,
            text: text,
            confirmButtonColor: '#20a8d8',
            timer: 2000,
        });
    };

    window.deleteConversation = function (userId) {
        $.ajax({
            type: 'get',
            url: deleteConversationUrl + userId + '/delete',
            success: function (data) {
                if (data.success !== true) {
                    return false;
                }
                fireSwal('success', 'Deleted!', 'Conversation has been deleted!');
                if (latestSelectedUser === userId) {
                    let selectedUserEle = $('#user-' + latestSelectedUser).parents('.contact-area');
                    if (selectedUserEle.length === 0) {
                        selectedUserEle = $('#user-' + latestSelectedUser);
                    }
                    let nextEle = selectedUserEle.nextAll('.contact-area:first').find('.chat__person-box');
                    if (nextEle.length === 0) {
                        nextEle = selectedUserEle.nextAll('.chat__person-box:first');
                    }
                    if (nextEle.length > 0) {
                        $('#user-' + nextEle.data('id')).trigger('click');
                    } else {
                        let prevEle = selectedUserEle.prevAll('.contact-area:first').find('.chat__person-box');
                        if (prevEle.length === 0) {
                            prevEle = selectedUserEle.prevAll('.chat__person-box:first');
                        }
                        if (prevEle.length) {
                            console.log('prevEleId = ',prevEle.data('id'));
                            $('#user-' + prevEle.data('id')).trigger('click');
                        }
                    }
                }
                let userEle = $('#user-' + userId).parents('.contact-area');
                if (userEle.length === 0) {
                    userEle = $('#user-' + userId);
                }
                let activeChat = userEle.parents('#chatPeopleBody');
                let archiveChat = userEle.parents('#archivePeopleBody');
                userEle.remove();
                if (activeChat.length > 0 && chatPeopleBodyEle.find('.chat__person-box').length === 0) {
                    noConversationEle.show();
                    addNoConversationIndicator();
                    selectedContactId = 0;
                }
                if (archiveChat.length > 0 && $('#archivePeopleBody').find('.chat__person-box').length ===
                    0) {
                    showNoArchiveConversationEle();
                    addNoConversationIndicator();
                    selectedContactId = 0;
                }
            },
        });
    };

    const swalDelete = Swal.mixin({
        customClass: {
            confirmButton: 'btn btn-danger mr-2 btn-lg',
            cancelButton: 'btn btn-secondary btn-lg',
        },
        buttonsStyling: false,
    });

    $(document).on('click', '.chat__person-box-delete', function (e) {
        let chatDelEle = $(this);
        let userId = chatDelEle.parents('.chat__person-box').data('id');
        let contactName = $('#user-' + userId).find('.contact-name').text().toString().trim();

        swalDelete.fire({
            title: 'Are you sure?',
            html: 'Delete chat with <b>' + contactName + '</b>?',
            icon: 'warning',
            showCancelButton: true,
            confirmButtonText: 'Yes, delete it!',
        }).then((result) => {
            if (result.value) {
                deleteConversation(userId);
            }
        });

        //here we write stopPropagation to stop ajax call of select chat after this delete call, if we not write this than select conversation call will happen
        e.stopPropagation();
    });

    $(document).on('click', '.chat__person-box-archive', function (e) {
        let chatArchiveEle = $(this);
        let userId = chatArchiveEle.parents('.chat__person-box').data('id');
        let isArchiveChat = $(this).parents('#archivePeopleBody').length;
        let contactName = $('#user-' + userId).find('.contact-name').text();
        let ArchiveUnarchive = (isArchiveChat) ? 'Unarchive' : 'Archive';

        swalDelete.fire({
            title: 'Are you sure?',
            html: ArchiveUnarchive + ' chat with <b>' + contactName + '</b>?',
            icon: 'warning',
            showCancelButton: true,
            confirmButtonText: 'Yes',
        }).then((result) => {
            if (result.value) {
                archiveConversation(userId);
            }
        });

        //here we write stopPropagation to stop ajax call of select chat after this delete call, if we not write this than select conversation call will happen
        e.stopPropagation();
    });

    window.archiveConversation = function (userId) {
        $.ajax({
            type: 'get',
            url: deleteConversationUrl + userId + '/archive-chat',
            success: function (data) {
                if (data.success === true) {
                    if (data.data.archived) {
                        fireSwal('success', 'Archived!',
                            'Conversation has been archived!');
                    } else {
                        fireSwal('success', 'Unarchived!',
                            'Conversation has been unarchived!');
                    }

                    let archiveConversation = $('#user-' + userId);
                    $('#user-' + userId).remove();

                    if (data.data.archived) {
                        archiveConversation.find('.chat__person-box-archive').
                            text('Unarchive Chat');
                        archivePeopleBodyEle.append(archiveConversation);
                        makeArchiveChatTabActive();
                    } else {
                        archiveConversation.find('.chat__person-box-archive').
                            text('Archive Chat');
                        chatPeopleBodyEle.append(archiveConversation);
                        makeActiveChatTabActive();
                    }

                    showNoArchiveConversationEle();
                    showNoActiveConversationEle();
                }
            },
        });
    };

    window.makeActiveChatTabActive = function () {
        $('.nav-item a[href="#chatPeopleBody"]').tab('show');
    };

    window.makeArchiveChatTabActive = function () {
        $('.nav-item a[href="#archivePeopleBody"]').tab('show');
    };

    window.showNoArchiveConversationEle = function () {
        if (archivePeopleBodyEle.find('.chat__person-box').length === 0) {
            noArchiveConversationEle.show();
        } else {
            noArchiveConversationEle.hide();
        }
    };

    window.showNoActiveConversationEle = function () {
        if (chatPeopleBodyEle.find('.chat__person-box').length === 0) {
            noConversationEle.show();
        } else {
            noConversationEle.hide();
        }
    };

    window.removeTimeline = function (messageEle) {
        let timeLineEle = messageEle.prev('.chat__msg-day-divider');
        if (timeLineEle.length) {
            var nextElementLength = messageEle.next().length;
            if (nextElementLength === 0) {
                timeLineEle.remove();
            }
        }
    };

    window.checkAllMsgAndShowNoMsgYet = function () {
        let conversationContainer = $('#conversation-container');
        let senderMsgLength = conversationContainer.find(
            '.chat-conversation__sender').length;
        let receiverMsgLength = conversationContainer.find(
            '.chat-conversation__receiver').length;
        let badgeMessages = $('.chat-conversation').
            find('#message-badges').length;
        if (senderMsgLength === 0 && receiverMsgLength === 0 &&
            badgeMessages === 0) {
            let chatPersonBox = $('.chat__person-box--active');
            conversationContainer.html('');
            noMsgesYet.show();
            addNoMessagesIndicator();
            chatPersonBox.find('.chat-message').text('');
            chatPersonBox.find('.chat__person-box-time').text('');
        }
    };

    window.deleteMsgForEveryone = function (messageId, previousMessageId) {
        $.ajax({
            type: 'post',
            url: '/conversations/' + messageId + '/delete',
            data: { 'previousMessageId': previousMessageId },
            success: function (data) {
                if (data.success === true) {
                    let previousMessage = data.data.previousMessage;
                    fireSwal('success', 'Deleted!',
                        'Message has been deleted!');
                    let messageEle = $('.message-' + messageId);
                    removeTimeline(messageEle);

                    /** UPDATE MEDIA IN PROFILE BAR*/
                    removeMediaFromProfileBar(messageId);

                    if (previousMessage != null && messageEle.nextAll(
                        '#send-receive-direction:first').length === 0) {
                        let chatPersonBox = $('.chat__person-box--active');

                        chatPersonBox.find('.chat-message').
                            html(getMessageByItsTypeForChatList(
                                previousMessage.message,
                                previousMessage.message_type,
                                previousMessage.file_name));
                        chatPersonBox.find('.chat__person-box-time').
                            text(getLocalDate(previousMessage.created_at));
                    }
                    messageEle.remove();
                    checkAllMsgAndShowNoMsgYet();
                }
            },
            error: function (result) {
                displayToastr('Error', 'error',
                    result.responseJSON.message);
            },
        });
    };

    window.deleteMessage = function (messageId, previousMessageId) {
        $.ajax({
            type: 'post',
            url: deleteMessageUrl + messageId + '/delete',
            data: { 'previousMessageId': previousMessageId },
            success: function (data) {
                if (data.success === true) {
                    let previousMessage = data.data.previousMessage;
                    fireSwal('success', 'Deleted!',
                        'Message has been deleted!');
                    let messageEle = $('.message-' + messageId);
                    removeTimeline(messageEle);

                    /** UPDATE MEDIA IN PROFILE BAR*/
                    removeMediaFromProfileBar(messageId);

                    if (previousMessage != null && messageEle.nextAll(
                        '#send-receive-direction:first').length === 0) {
                        let chatPersonBox = $('.chat__person-box--active');

                        chatPersonBox.find('.chat-message').
                            html(getMessageByItsTypeForChatList(
                                previousMessage.message,
                                previousMessage.message_type,
                                previousMessage.file_name));
                        chatPersonBox.find('.chat__person-box-time').
                            text(getLocalDate(previousMessage.created_at));
                    }
                    messageEle.remove();
                    checkAllMsgAndShowNoMsgYet();
                }
            },
            error: function (result) {
                displayToastr('Error', 'error', result.responseJSON.message);
            },
        });
    };

    /** User Profile Updated */
    Echo.private(`updates`).
        listen('UpdatesEvent', (e) => {
            if (e.type == 1) { //user profile updates
                let user = e.user;
                $('#userListForChat').find('.chat-user-' + user.id).find('img').
                    attr('src', user.photo_url);
                $('#userListForChat').find('.chat-user-' + user.id).
                    find('.add-user-contact-name').text(user.name);
                $('#user-' + user.id).find('img').attr('src', user.photo_url);
                $('#user-' + user.id).find('.contact-name').text(user.name);
                $('.user-chat-image-' + user.id).attr('src', user.photo_url).attr('data-original-title', user.name);

                let groupMember = $('#nav-group-members').
                    find('#user-' + user.id);
                groupMember.find('.contact-name').text(user.name);
                groupMember.find('img').attr('src', user.photo_url);
            } else if (e.type == 2) { //set user status
                let userStatus = e.user_status;
                let userEle = $('#user-' + userStatus.user_id);
                let isMyContact = userEle.attr('data-is_my_contact');
                if (isMyContact == '0' || isMyContact == 'false') {
                    return false;
                }
                let groupMember = $('#nav-group-members').
                    find('#user-' + userStatus.user_id).
                    find('.group-user-status');
                let myContactUser = $('#myContactListForChat').
                    find('.chat-user-' + userStatus.user_id).
                    find('.my-contact-user-status');
                let template = $.templates('#tmplUserNewStatus');
                let htmlOutput = template.render(userStatus);
                userEle.find('.contact-status').html(htmlOutput);
                groupMember.html(htmlOutput);
                myContactUser.html(htmlOutput);
                if (selectedContactId == userStatus.user_id) {
                    $('.contact-title-status').html(htmlOutput);
                }
                loadTooltip();
            } else if (e.type == 3) { // clear user status
                $('#user-' + e.user_id).find('.contact-status').html('');
                if (selectedContactId == e.user_id) {
                    $('.contact-title-status').html('');
                }
                $('#nav-group-members').
                    find('#user-' + e.user_id).
                    find('.group-user-status').
                    html('');
                $('#myContactListForChat').
                    find('.chat-user-' + e.user_id).
                    find('.my-contact-user-status').
                    html('');
                loadTooltip();
            }
        });

    function prepareNewGroupChatConversation (groupObj) {
        let msgText = groupObj.group_created_by + ' added you in group ' + '"' +
            groupObj.name + '"';

        let isGroupTabExist = $('#user-' + groupObj.id);
        if (isGroupTabExist.length > 0) {
            $('#user-' + groupObj.id).find('.chat-message').
                text(msgText);
            $('#user-' + groupObj.id).find('.chat__person-box-count').
                removeClass('d-none').
                text(1);
            $('#user-' + groupObj.id).find('.chat__person-box-time').
                text(getLocalDate(groupObj.created_at));
            noConversationEle.hide();
            listenForGroupUpdates(groupObj.id);
            return;
        }

        //group not exist in chat-list so start new conversation
        let newUserEle = prepareNewConversation(
            groupObj.id,
            htmlSpecialCharsDecode(groupObj.name),
            '',
            groupObj.photo_url,
            '',
            1,
        );
        chatPeopleBodyEle.prepend(newUserEle);
        $('#user-' + groupObj.id).find('.chat-message').
            text(msgText);
        $('#user-' + groupObj.id).find('.chat__person-box-count').
            removeClass('d-none').
            text(1);
        $('#user-' + groupObj.id).find('.chat__person-box-time').
            text(getLocalDate(groupObj.created_at));
        noConversationEle.hide();
        listenForGroupUpdates(groupObj.id);
    }

    window.listenForGroupUpdates = function (groupId) {
        /** Group Updated Event */
        Echo.private(`group.${groupId}`).
            listen('GroupEvent', (e) => {
                let group = e;
                let currentGroupId = $('.chat__person-box--active').data('id');

                // Group details updated
                if (e.type === 1) {
                    updateGroupDetails(e.group);
                } else if (e.type === 2 && currentGroupId == e.group.id) { // Group member role changed
                    updateGroupMemberRole(e.group.id, e.user_id, e.is_admin,
                        e.userIds);
                } else if (e.type === 3 && currentGroupId == e.group.id) { // member removed from group
                    removeMemberFromGroup(e.group.id, e.user_id);
                } else if (e.type === 4 && currentGroupId == e.group.id) { // new members added into group
                    let data = e.group;
                    data.my_role = myRoleInGroup;
                    data.users = e.group.users;
                    addMembersToGroup(e.group.id, data);
                } else if (e.type === 5 && currentGroupId == e.group.id) { // group deleted by owner
                    groupDeletedByOwner(e.group.id);
                } else if (e.type === 6 && currentGroupId == e.group.id) { // message read by all group members
                    setTimeout(function () {
                        $('.message-' + e.conversation_id).
                            find('.chat-container__read-status').
                            addClass('chat-container__read-status--read');
                    }, 1000);
                } else if (e.type === 7) { // new group message arrived
                    groupMessageArrived(e);
                } else if (e.type === 8) { // group messages read by group member
                    updateReadByUsersOfGroupMessage(e);
                }
            });
    };

    window.updateReadByUsersOfGroupMessage = function (readByInfo) {
        if (currentConversationGroupId !== readByInfo.group.id || readByInfo.conversation_ids.length === 0) {
            return false;
        }
        $.each(readByInfo.conversation_ids, function (index, conversationId) {
            let msgReadByUsersEle = $(document).find('.message-'+conversationId+'-read-by-users');

            $.each(conversationMessages, function (index, messageInfo) {
                if (messageInfo.id == conversationId) {
                    $.each(messageInfo.read_by, function (index, val) {
                        if (val.read_at == null && val.user_id ==
                            readByInfo.read_by_user_id) {
                            val.read_at = readByInfo.read_at;
                            return false;
                        }
                    });
                    if (msgReadByUsersEle.length > 0) {
                        showConversationInfo(messageInfo);
                    }
                    return false;
                }
            });
        });
    };

    function groupMessageArrived (e) {
        if (selectedContactId == e.to_id) {
            let groupEle = chatPeopleBodyEle.find('#user-' + e.to_id);
            let msgCountEle = groupEle.find('.chat__person-box-count');
            let msgCount = msgCountEle.text();
            msgCount = (isNaN(msgCount) || msgCount === '')
                ? 0
                : msgCount;
            callAfterAPI = false;

            // if (msgCount > 0) {
            //     updateMessageInSenderwindow(e);
            //     msgCount = add(msgCount, 1);
            //     $('.chat__person-box--active').
            //         find('.chat__person-box-count').
            //         text(msgCount).
            //         removeClass('d-none');
            //     return;
            // }

            //already chat window is open whoes message has arrive
            setSentOrReceivedMessage(e);

            if (groupEle.length) {
                addUserToTopOfConversation(e.to_id, groupEle);
            }

            // It will read upto 7 messages from 1st to 7th and other messages are managed by scroll
            // if ($('.chat-conversation').length <= 7) {
            //     fireReadMessageEventUsingIds([e.id]);
            // }
        } else if (chatPeopleBodyEle.find('#user-' + e.to_id).length) {
            //chat window is not open so update message count
            let groupEle = chatPeopleBodyEle.find('#user-' + e.to_id);
            let msgCountEle = groupEle.find('.chat__person-box-count');
            let oldMsgCount = msgCountEle.text();
            oldMsgCount = (isNaN(oldMsgCount) || oldMsgCount === '')
                ? 0
                : oldMsgCount;
            if (oldMsgCount == 0) {
                totalUnreadConversations += 1;
                updateUnreadMessageCount(0);
            }

            let newMsgCount = add(oldMsgCount, 1);
            msgCountEle.removeClass('d-none').text(newMsgCount).show();
            groupEle.find('.chat-message').
                html(getMessageByItsTypeForChatList(e.message,
                    e.message_type, e.file_name));
            groupEle.find('.chat__person-box-time').
                text(getLocalDate(e.created_at));
            addUserToTopOfConversation(e.to_id, groupEle);
        } else {
            totalUnreadConversations += 1;
            updateUnreadMessageCount(0);
            //group not exist in chat-list so start new conversation
            let newUserEle = prepareNewConversation(e.to_id,
                htmlSpecialCharsDecode(e.group.name), e,
                e.group.photo_url, '', 1);
            chatPeopleBodyEle.prepend(newUserEle);
            noConversationEle.hide();
        }
    }

    function groupDeletedByOwner (groupId) {
        $('.members-count').hide();
        $('.div-group-members-nav').
            empty().
            append(
                '<p class="no-group-members-found text-center">No group members found...</p>');
        $('.btn-add-members').parent().remove();
        $('.btn-leave-from-group').parent().remove();
        $('.chat__area-text').remove();
        $('.edit-group').parent().remove();
    }

    function prepareEditGroupIconHTML (groupId) {
        return '<div class="col-2"><i class="fa fa-edit edit-group pointer text-center" data-id="' +
            groupId + '"></i></div>';
    }

    function prepareButtonAddMembers (groupId) {
        return '<div class="chat-profile__column pb-0"><a href="#" class="btn btn-success btn-add-members" data-group-id="' +
            groupId + '">Add Members</a></div>';
    }

    function updateGroupDetails (group) {
        let currentGroupId = $('.chat__person-box--active').data('id');
        $('#groupDetailsDescription-' + group.id).text(group.description);
        if (!group.description) {
            $('#groupDetailsDescription-' + group.id).
                text('No description added yet...');
        }
        $('#groupDetailsName-' + group.id).text(group.name);
        $('#groupDetailsImage-' + group.id).attr('src', group.photo_url);
        $('#user-' + group.id).
            find('.chat__person-box-name').
            text(group.name);
        $('#user-' + group.id).
            find('.chat__person-box-avtar img').
            attr('src', group.photo_url);

        $('.group-list-' + group.id).find('img').attr('src', group.photo_url);
        $('.group-list-' + group.id).
            find('.add-user-contact-name').
            text(group.name);

        if (currentGroupId != group.id) {
            return;
        }

        $('.contact-title').text(group.name);
        $('.chat-header-img').attr('src', group.photo_url);

        if (group.group_type === 2 && group.my_role !== 2) {
            $('.chat__area-text').remove();
        } else {
            appendChatArea();
        }

        if (group.privacy === 2) {
            $('.group-profile-image').append(privateGroupIcon);

            if (myRoleInGroup === 1) {
                $('.btn-add-members').parent().remove();
            }
        } else {
            $('.group-profile-image').find('.private-group-badge').remove();
            if ($('.group-profile-data').find('.btn-add-members').length <= 0) {
                let addMemeberText = prepareButtonAddMembers(group.id);
                $('.btn-leave-from-group').parent().before(addMemeberText);
            }
        }

        if (group.group_type === 2) {
            $('.group-profile-image').append(closedGroupIcon);
            if (myRoleInGroup === 1) {
                $('.chat__area-text').remove();
            }
        } else {
            $('.group-profile-image').find('.closed-group-badge').remove();
            appendChatArea();
        }
    }

    function updateGroupMemberRole (
        groupId, memberId, isAdmin = true, members = []) {
        if (isAdmin) {
            let dismissAdminTag = prepareGroupAdminText(
                memberId, groupId, false,
            );
            $('#makeAdmin-' + memberId).remove();
            $('.member-options-' + memberId).append(dismissAdminTag);
            $('.group-member-' + memberId).
                find('.chat__person-box-detail').
                append(
                    '<span class="badge badge-pill badge-success">Admin</span>');
            let editGroupIconTag = prepareEditGroupIconHTML(groupId);
            let editGroupIcon = $('.divGroupDetails').find('.edit-group');
            if (editGroupIcon.length === 0) {
                $('.divGroupDetails').find('.col-10').after(editGroupIconTag);
            }
            if (parseInt(loggedInUserId) === memberId) {
                addOptionsForAllMembers(members, groupId);
                $('.btn-add-members').show();
            }
        } else {
            let adminTag = prepareGroupAdminText(memberId, groupId);
            $('#dismissAdmin-' + memberId).remove();
            $('.member-options-' + memberId).append(adminTag);
            $('.group-member-' + memberId).
                find('.chat__person-box-detail span').
                remove();
            if (parseInt(loggedInUserId) === memberId) {
                $('.edit-group').parent().remove();
                removeOptionsForMember(members, groupId);
                $('.btn-add-members').hide();
            }
        }
    }

    function addOptionsForAllMembers (members, groupId) {
        $.each(members, function (index, value) {
            if (value === parseInt(loggedInUserId)) {
                return;
            }

            let template = $.templates('#tmplMemberOptions');
            let htmlOutput = template.render(
                { member_id: value, group_id: groupId });
            $('.group-member-' + value).append(htmlOutput);
        });
    }

    function removeOptionsForMember (members, groupId) {
        $.each(members, function (index, value) {
            if (value === parseInt(loggedInUserId)) {
                return;
            }
            $('.group-member-' + value).
                find('.chat__person-box-msg-time').
                remove();
        });
    }

    function removeMemberFromGroup (groupId, userId) {
        membersCountArr[groupId] -= 1;
        $('.members-count').text(membersCountArr[groupId]);
        for (var i = 0; i < groupMembers.length; i++) {
            if (groupMembers[i] === parseInt(userId)) {
                groupMembers.splice(i, 1);
            }
        }

        $('.group-member-' + userId).remove();

        if (userId === parseInt(loggedInUserId)) {
            Echo.leave('group.' + groupId); // Unsubscribe to channel
            $('.chat__area-text').remove();

            let deleteButtonText = prepareDeleteGroupButton(groupId);
            $('.btn-add-members').parent().remove();
            $('.btn-leave-from-group').parent().remove();
            $('.group-profile-data').append(deleteButtonText);
        }
    }

    function addMembersToGroup (groupId, data) {
        membersCountArr[groupId] += data.users.length;
        $('.members-count').text(membersCountArr[groupId]);
        let template = $.templates('#tmplSingleGroupMember');
        let htmlOutput = template.render(data);
        $('.div-group-members-nav').append(htmlOutput);
    }

    $(document).on('click', '.msg-delete-for-everyone', function (e) {
        e.preventDefault();

        let messageDelEle = $(this);
        let messageId = messageDelEle.parent().
            parent().
            parent().
            parent().
            data('message_id');
        let messageEle = $('.message-' + messageId);
        let previousMessageEle = messageEle.prevAll(
            '#send-receive-direction:first');
        let previousMessageId = 0;
        let badgeMsg = messageEle.prev('#message-badges');

        if (badgeMsg.length) {
            previousMessageId = badgeMsg.data('message_id');
        } else if (previousMessageEle.length) {
            previousMessageId = previousMessageEle.data('message_id');
        }

        swalDelete.fire({
            title: 'Are you sure?',
            html: 'Delete this message?',
            icon: 'warning',
            showCancelButton: true,
            confirmButtonText: 'Yes, delete it!',
        }).then((result) => {
            if (result.value) {
                deleteMsgForEveryone(messageId, previousMessageId);
            }
        });

        e.stopPropagation();
    });

    $(document).on('click', '.msg-delete-icon', function (e) {
        e.preventDefault();
        let messageDelEle = $(this);
        let messageId = messageDelEle.parent().
            parent().
            parent().
            parent().
            data('message_id');
        let messageEle = $('.message-' + messageId);
        let previousMessageEle = messageEle.prevAll(
            '#send-receive-direction:first',
        );
        let previousMessageId = 0;
        let badgeMsg = messageEle.prev('#message-badges');

        if (badgeMsg.length) {
            previousMessageId = badgeMsg.data('message_id');
        } else if (previousMessageEle.length) {
            previousMessageId = previousMessageEle.data('message_id');
        }

        swalDelete.fire({
            title: 'Are you sure?',
            html: 'Delete this message?',
            icon: 'warning',
            showCancelButton: true,
            confirmButtonText: 'Yes, delete it!',
        }).then((result) => {
            if (result.value) {
                deleteMessage(messageId, previousMessageId);
            }
        });

        e.stopPropagation();
    });

    function performActionsAfterUnblock (user) {
        $('.blocked-user-' + user.id).remove();
        prepareContactForModal({ users: user }, true);
        if ($('#blockedUsersList').length <= 1) {
            $('.no-blocked-user').show();
            $('.no-blocked-user').find('span').text('No users blocked yet...');
        }

        $('.typing').show();
        $('#user-' + user.id).find('.chat__person-box-status').show();
        $('.chat-profile__person-status').show();

        if ($('.chat__person-box--active').data('id') == user.id) {
            appendChatArea();
            $('.block-unblock-span').text('Block');
            $('.hdn-text-message').remove();
            $('.blocked-message-text').remove();

        }
    }

    function appendChatArea () {
        $('.chat__area-wrapper').append(chatSendArea);
        loadEojiArea();
        sendMessage();
    }

    function performActionAfterBlock (user) {
        $('.chat__area-text').remove();
        $('.blocked-message-text').remove();
        $('.block-unblock-span').text('Unblock');
        $('.chat__area-wrapper').append(blockedMessageText);
        $('.chat-user-' + user.id).remove();
        $('.typing').hide();
        $('#user-' + user.id).find('.chat__person-box-status').hide();
        $('.chat-profile__person-status').hide();
        prepareBlockedUsers({ users: user }, true);
    }

    function blockUnblockUser (data, blockedTo) {
        let isBlocked = (data.is_blocked) ? true : false;
        $.ajax({
            url: userURL + blockedTo + '/block-unblock',
            type: 'PUT',
            data: data,
            success: function (result) {
                if (result.success) {
                    displayToastr('Success', 'success', result.message);
                    let user = result.data.user;
                    if (isBlocked) {
                        performActionAfterBlock(user);
                    } else {
                        performActionsAfterUnblock(user);
                    }
                }
            },
            error: function (result) {
                displayToastr('Error', 'error',
                    result.responseJSON.message);
            },
        });
    }

    /** UnBLock user */
    $(document).on('click', '.btn-unblock', function (e) {
        e.preventDefault();
        swalDelete.fire({
            title: 'Are you sure?',
            html: 'Unblock this user?',
            icon: 'warning',
            showCancelButton: true,
            confirmButtonText: 'Yes',
        }).then((result) => {
            if (result.value) {
                placeCaret = false;
                let userId = $(this).data('id');
                blockUnblockUser(
                    { is_blocked: false, blocked_to: userId }, userId,
                );
            }
        });
    });

    /*** Block UnBLock */
    $(document).on('click', '.block-unblock-user-switch', function (e) {
        let isBlocked = $(this).is(':checked');
        let blockedTo = $('#senderId').val();
        let data = {};
        data.is_blocked = isBlocked;
        data.blocked_to = blockedTo;

        let blockUserText = (isBlocked) ? 'block' : 'unblock';
        swalDelete.fire({
            title: 'Are you sure?',
            html: 'You want to ' + blockUserText + ' this user?',
            icon: 'warning',
            showCancelButton: true,
            confirmButtonText: 'Yes',
        }).then((result) => {
            if (!result.value) {
                $('.block-unblock-user-switch').
                    prop('checked', (isBlocked) ? false : true);
                return;
            }

            blockUnblockUser(data, blockedTo);
        });
    });

    $(document).on('change', '#groupImage', function () {
        let ext = $(this).val().split('.').pop().toLowerCase();
        if ($.inArray(ext, ['gif', 'png', 'jpg', 'jpeg']) == -1) {
            $(this).val('');
            $('#groupValidationErrorsBox').
                html(
                    'The profile image must be a file of type: jpeg, jpg, png.').
                show();
        } else {
            displayPhoto(this, '#groupPhotoPreview');
        }
    });

    window.displayPhoto = function (input, selector) {
        let displayPreview = true;
        if (input.files && input.files[0]) {
            let reader = new FileReader();
            reader.onload = function (e) {
                let image = new Image();
                image.src = e.target.result;
                image.onload = function () {
                    $(selector).attr('src', e.target.result);
                    displayPreview = true;
                };
            };
            if (displayPreview) {
                reader.readAsDataURL(input.files[0]);
                $(selector).show();
            }
        }
    };

    /** Create Group OR Update Group */

    function createGroup (data) {
        $.ajax({
            type: 'post',
            url: createGroupURL,
            data: data,
            processData: false,
            contentType: false,
            success: function (result) {
                displayToastr('Success', 'success', result.message);
                $('#btnCreateGroup').removeAttr('disabled');
                prepareNewGroupChatConversation(result.data);
                $('#user-' + result.data.id).trigger('click');
                $('.chat__person-box--active').
                    find('.chat__person-box-count').
                    text(0).
                    hide();
                $('#createNewGroup').modal('hide');
            },
            error: function (result) {
                displayToastr('Error', 'error', result.responseJSON.message);
            },
        });
    }

    function updateGroup (data, id) {
        $.ajax({
            type: 'POST',
            url: createGroupURL + '/' + id,
            data: data,
            processData: false,
            contentType: false,
            success: function (result) {
                let group = result.data.group;
                if (result.data.conversation) {
                    setSentOrReceivedMessage(result.data.conversation);
                }
                displayToastr('Success', 'success', result.message);
                // Update Group Details
                performActionAfterUpdatingGroup(group);
            },
            error: function (result) {
                displayToastr('Error', 'error', result.responseJSON.message);
            },
        });
    }

    function performActionAfterUpdatingGroup (group) {
        let groupId = group.id;
        $('#groupDetailsDescription-' + groupId).text(group.description);
        if (!group.description) {
            $('#groupDetailsDescription-' + groupId).
                text('No description added yet...');
        }
        $('#groupDetailsName-' + groupId).text(group.name);
        $('#groupDetailsImage-' + groupId).attr('src', group.photo_url);
        $('.group-list-' + groupId).find('img').attr('src', group.photo_url);
        $('.group-list-' + groupId).
            find('.add-user-contact-name').
            text(group.name);
        $('.contact-title').text(group.name);
        $('.chat-header-img').attr('src', group.photo_url);
        $('.chat__person-box--active').
            find('.chat__person-box-name').
            text(group.name);
        $('.chat__person-box--active').
            find('.chat__person-box-avtar img').
            attr('src', group.photo_url);

        if (group.group_type === 2) {
            $('.group-profile-image').append(closedGroupIcon);
        } else {
            $('.group-profile-image').find('.closed-group-badge').remove();
        }

        if (group.privacy === 2) {
            $('.group-profile-image').append(privateGroupIcon);
        } else {
            $('.group-profile-image').find('.private-group-badge').remove();
        }

        $('#createNewGroup').modal('hide');
    }

    $('#createGroupForm').on('submit', function (e) {
        e.preventDefault();
        let id = $('#groupId').val();
        let data = new FormData($(this)[0]);
        if (!id) {
            $('#btnCreateGroup').attr('disabled', true);
            $('#btnCreateGroup').button('loading');
            createGroup(data);
            return;
        }

        updateGroup(data, id);
    });

    /** Edit Group */
    $(document).on('click', '.edit-group', function (e) {
        let id = $(e.currentTarget).data('id');

        $.ajax({
            type: 'GET',
            url: groupsList + '/' + id,
            success: function (result) {
                if (result.success) {
                    let group = result.data;
                    $('#groupId').val(group.id);
                    $('#groupName').val(group.name);
                    $('#groupDesc').val(group.description);

                    if (group.group_type === 2) {
                        $('#groupTypeClose').iCheck('check');
                    }

                    if (group.privacy === 2) {
                        $('#groupPrivate').iCheck('check');
                    }

                    $('#groupMembers').val(group.users);
                    $('#groupMembers').trigger('change');
                    $('#groupMembers').attr('required', false);

                    $('#groupPhotoPreview').attr('src', group.photo_url);

                    $('.group-modal-title').text('Edit Group');
                    $('#groupMembers').parent().hide();

                    if (group.my_role !== 2) {
                        $('.div-group-privacy').addClass('d-none');
                        $('.div-group-type').addClass('d-none');
                    }

                    $('#createNewGroup').modal('show');
                }
            },
            error: function (error) {
                displayToastr('Error', 'error', error.responseJSON.message);
            },
        });

        e.stopPropagation();
    });

    $('#createNewGroup').on('hidden.bs.modal', function () {
        $('.group-modal-title').text('New Group');
        $('#groupId').val('');
        $('#groupTypeOpen').iCheck('check');
        $('#groupPublic').iCheck('check');
        $('#groupMembers').select2('val', '');
        $('#groupMembers').parent().show();
        $('.div-group-privacy').removeClass('d-none');
        $('.div-group-type').removeClass('d-none');
        $('#btnCreateGroup').removeAttr('disabled');
        $('#btnCreateGroup').button('reset');
        resetModalForm('#createGroupForm', '#groupValidationErrorsBox');
    });

// Fill members to group members modal
    $(document).on('click', '.btn-add-members', function (e) {
        e.preventDefault();
        let groupId = $(e.currentTarget).data('group-id');

        $.ajax({
            type: 'GET',
            url: getUsers,
            success: function (result) {
                if (result.success) {
                    let data = result.data;
                    if (data.users.length > 0) {
                        $('.no-group-members').hide();
                    }

                    let template = $.templates('#tmplAddGroupMembers');
                    let users = result.data;
                    users.group_id = groupId;
                    users.group_members = groupMembers;
                    $('.btn-add-members-to-group').
                        attr('data-group-id', groupId);

                    let helpers = { isMembersInGroup: isMembersInGroup };
                    var htmlOutput = template.render(users, helpers);

                    $('#groupMembersForChat').empty();
                    $('#groupMembersForChat').html(htmlOutput);

                    $('.select-group-members').iCheck({
                        checkboxClass: 'icheckbox_square-green',
                        radioClass: 'iradio_square',
                        increaseArea: '20%', // optional

                    });
                    $('#modalAddGroupMembers').modal('show');
                }
            },
            error: function (error) {
                displayToastr('Error', 'error', error.responseJSON.message);
            },
        });
    });

    window.isMembersInGroup = function (groupMembers, memberId) {
        if ($.inArray(memberId, groupMembers) === -1) {
            return false;
        }

        return true;
    };

    /** Add Members to Group */
    $(document).on('click', '.btn-add-members-to-group', function (e) {
        e.preventDefault();
        let members = [];
        $.each($('input[name=\'group_members\']:checked'), function () {
            if (this.disabled) {
                return;
            }
            members.push(parseInt($(this).val()));
        });

        if (members.length === 0) {
            return;
        }

        $(this).button('loading');
        $(this).attr('disabled');

        $.ajax({
            type: 'PUT',
            url: groupsList + '/' + currentSelectedGroupId + '/add-members',
            data: { members: members },
            success: function (result) {
                if (result.success) {
                    addMembersToGroup(currentSelectedGroupId,
                        result.data.group);
                    $.merge(groupMembers, members);
                    setSentOrReceivedMessage(result.data.conversation);
                    displayToastr('Success', 'success', result.message);
                }
            },
            error: function (error) {
                displayToastr('Error', 'error', error.responseJSON.message);
            },
            complete: function () {
                $('#modalAddGroupMembers').modal('hide');
            }
        });
    });

    $('#modalAddGroupMembers').on('hidden.bs.modal', function () {
        $('.btn-add-members-to-group').removeAttr('disabled');
        $('.btn-add-members-to-group').button('reset');
    });

    /** Remove Member from Group */
    $(document).on('click', '.remove-member-from-group', function (e) {
        e.preventDefault();
        swalDelete.fire({
            title: 'Are you sure?',
            html: 'Remove member from this group ?',
            icon: 'warning',
            showCancelButton: true,
            confirmButtonText: 'Yes, remove it!',
        }).then((result) => {
            if (result.value) {

                let id = $(e.currentTarget).data('member-id');
                let groupId = $(e.currentTarget).data('group-id');

                $.ajax({
                    type: 'DELETE',
                    url: groupsList + '/' + groupId + '/members/' + id,
                    success: function (result) {
                        if (result.success) {
                            setSentOrReceivedMessage(result.data);
                            removeMemberFromGroup(groupId, id);
                            $('#modalAddGroupMembers').modal('hide');
                            displayToastr('Success', 'success', result.message);
                        }
                    },
                    error: function (error) {
                        displayToastr('Error', 'error',
                            error.responseJSON.message);
                    },
                });
            }
        });
        e.stopPropagation();
    });

    /** Make Member to Group Admin */
    $(document).on('click', '.make-member-to-group-admin', function (e) {
        e.preventDefault();
        swalDelete.fire({
            title: 'Are you sure?',
            html: 'Make this member to Admin?',
            icon: 'warning',
            showCancelButton: true,
            confirmButtonText: 'Yes',
        }).then((result) => {
            if (result.value) {

                let id = $(e.currentTarget).data('member-id');
                let groupId = $(e.currentTarget).data('group-id');

                $.ajax({
                    type: 'PUT',
                    url: groupsList + '/' + groupId + '/members/' + id +
                        '/make-admin',
                    success: function (result) {
                        if (result.success) {
                            setSentOrReceivedMessage(result.data);
                            myRoleInGroup = 2;
                            updateGroupMemberRole(groupId, id, true);
                            displayToastr('Success', 'success', result.message);
                        }
                    },
                    error: function (error) {
                        displayToastr('Error', 'error',
                            error.responseJSON.message);
                    },
                });
            }
        });
        e.stopPropagation();
    });

    /** Dismiss Group Admin  */
    $(document).on('click', '.dismiss-admin-member', function (e) {
        e.preventDefault();
        swalDelete.fire({
            title: 'Are you sure?',
            html: 'Dismiss this member from Admin?',
            icon: 'warning',
            showCancelButton: true,
            confirmButtonText: 'Yes',
        }).then((result) => {
            if (result.value) {

                let id = $(e.currentTarget).data('member-id');
                let groupId = $(e.currentTarget).data('group-id');

                $.ajax({
                    type: 'PUT',
                    url: groupsList + '/' + groupId + '/members/' + id +
                        '/dismiss-as-admin',
                    success: function (result) {
                        if (result.success) {
                            setSentOrReceivedMessage(result.data);
                            myRoleInGroup = 1;
                            updateGroupMemberRole(groupId, id, false);
                            displayToastr('Success', 'success', result.message);
                        }
                    },
                    error: function (error) {
                        displayToastr('Error', 'error',
                            error.responseJSON.message);
                    },
                });
            }
        });
        e.stopPropagation();
    });

    /** Leave Group  */
    $(document).on('click', '.btn-leave-from-group', function (e) {
        e.preventDefault();
        swalDelete.fire({
            title: 'Are you sure?',
            html: 'You want to leave this group?',
            icon: 'warning',
            showCancelButton: true,
            confirmButtonText: 'Yes!',
        }).then((result) => {
            if (result.value) {

                let groupId = $(e.currentTarget).data('group-id');

                $.ajax({
                    type: 'DELETE',
                    url: groupsList + '/' + groupId + '/leave',
                    success: function (result) {
                        if (result.success) {
                            membersCountArr[groupId] -= 1;
                            $('.members-count').text(membersCountArr[groupId]);
                            Echo.leave('group.' + groupId); // Unsubscribe to channel
                            $('.typing').remove();
                            displayToastr('Success', 'success', result.message);
                            setSentOrReceivedMessage(result.data);
                            $('.btn-leave-from-group').parent().remove();
                            let deleteGroup = prepareDeleteGroupButton(groupId);
                            $('.group-member-' + loggedInUserId).remove();
                            $('.group-profile-data').append(deleteGroup);
                            $('.chat__area-text').remove();
                        }
                    },
                    error: function (error) {
                        displayToastr('Error', 'error', error.message);
                    },
                });
            }
        });
        e.stopPropagation();
    });

    /** Remove Member From Group  */
    $(document).on('click', '.btn-delete-group', function (e) {
        e.preventDefault();
        swalDelete.fire({
            title: 'Are you sure?',
            html: 'You want to remove this Group ?',
            icon: 'warning',
            showCancelButton: true,
            confirmButtonText: 'Yes!',
        }).then((result) => {
            if (result.value) {

                let groupId = $(e.currentTarget).data('group-id');

                $.ajax({
                    type: 'DELETE',
                    url: groupsList + '/' + groupId + '/remove',
                    success: function (result) {
                        if (result.success) {
                            Echo.leave('group.' + groupId); // Unsubscribe to group message event
                            $('.chat__person-box--active').remove();
                            addNoConversationIndicator();
                            $('.btn-leave-from-group').parent().remove();
                            displayToastr('Success', 'success', result.message);
                        }
                    },
                    error: function (error) {
                        displayToastr('Error', 'error', error.message);
                    },
                });
            }
        });
        e.stopPropagation();
    });

    function prepareGroupAdminText (memberId, groupId, addAdminText = true) {
        if (addAdminText) {
            return '<a class="dropdown-item make-member-to-group-admin" href="#" data-member-id="' +
                memberId + '" data-group-id="' + groupId + '" id="makeAdmin-' +
                memberId + '">Make Admin</a>';
        }

        return '<a class="dropdown-item dismiss-admin-member" href="#" data-member-id="' +
            memberId + '" data-group-id="' + groupId + '" id="dismissAdmin-' +
            memberId + '">Dismiss As Admin</a>  ';
    }

    function prepareDeleteGroupButton (groupId) {
        return '<div class="chat-profile__column pt-1"> <a href="#" class="btn btn-danger btn-delete-group" data-group-id="' +
            groupId + '">Delete Group</a></div>';
    }

    window.updateUnreadMessageCount = function (countOfConversationRead) {
        totalUnreadConversations -= countOfConversationRead;
        if (totalUnreadConversations === 0 || totalUnreadConversations < 1) {
            $('title').text('Conversations | ' + appName);
            return;
        }

        let messageString = (totalUnreadConversations > 99)
            ? '(99+)'
            : '(' + totalUnreadConversations + ')';

        $('title').text(messageString + ' | Conversations | ' + appName);
    };

    window.removeMediaFromProfileBar = function (id) {
        $('#mediaProfile-' + id).remove();

        let length = $('.chat-profile__media-container').children().length;
        if (length == 1 || length == 0) {
            $('.no-photo-found').show();
        }
    };

    window.loadTooltip = function () {
        $('[data-toggle="tooltip"]').tooltip();
    };

    /** Select Checkbox when div clicked */
    $(document).
        on('click', '.group-members-list-chat-select__list-item', function (e) {
            let selector = $(this).find('.select-group-members');
            if ($(this).hasClass('opacity-07')) {
                return;
            }

            var isChecked = selector.prop('checked');
            if (!isChecked) {
                $(this).find('.select-group-members').iCheck('check');
            } else {
                $(this).find('.select-group-members').iCheck('uncheck');
            }
        });

    $(document).on('click', '.replay-close-btn', function (e) {
        removeReplayBox();
    });

    function removeReplayBox () {
        $('.chat__text-preview').remove();
        $('.chat-conversation').removeClass('chat-conversation-88');

        removeLocalStorageItem('reply');
    }

    function prepareReplyBox (data) {
        let helpers = { getURLFromMessageType: getURLFromMessageType };
        let template = $.templates('#tmplReplayBox');

        let html = template.render(data, helpers);
        $('.chat__area-text').before(html);
        $('.chat-conversation').addClass('chat-conversation-88');
        textMessageEle.data('emojioneArea').setFocus();

        return data;
    }

    $(document).on('click', '.msg-replay', function (e) {
        e.preventDefault();
        e.stopPropagation();
        removeReplayBox();
        let data = {};
        let receiver = $(this).data('sender');
        let userId = selectedContactId;
        let selfReply = $(this).data('self-reply');
        let messageType = $(this).data('message-type');

        if (selfReply) {
            receiver = 'You';
        }
        data.id = $(this).data('message-id');
        data.message = $(this).data('message');
        data.receiver = receiver;
        data.user_id = userId;
        data.messageType = messageType;
        prepareReplyBox(data);
        setLocalStorageItem('reply', JSON.stringify(data));
    });

    function getURLFromMessageType (type) {
        if (type == 2) {
            return pdfURL;
        } else if (type == 3) {
            return docsURL;
        } else if (type == 4) {
            return audioURL;
        } else if (type == 5) {
            return videoURL;
        } else if (type == 6) {
            return youtubeURL;
        } else if (type == 7) {
            return textURL;
        } else if (type == 8) {
            return xlsURL;
        }
    }

    if (conversationId !== '') {
        setTimeout(function () {
            let conversationEle = $(document).find('#user-' + conversationId);
            conversationEle.trigger('click');
        }, 6000);
    }

    /**
     * This handler retrieves the images from the clipboard as a base64 string and returns it in a callback.
     *
     * @param pasteEvent
     * @param callback
     */
    function retrieveImageFromClipboardAsBase64 (
        pasteEvent, callback, imageFormat) {
        if (pasteEvent.clipboardData == false) {
            if (typeof (callback) == 'function') {
                callback(undefined);
            }
        }

        let items = pasteEvent.clipboardData.items;

        if (items == undefined) {
            if (typeof (callback) == 'function') {
                callback(undefined);
            }
        }

        for (let i = 0; i < items.length; i++) {
            // Skip content if not image
            if (items[i].type.indexOf('image') == -1) continue;
            // Retrieve image on clipboard as blob
            let blob = items[i].getAsFile();

            // Create an abstract canvas and get context
            let mycanvas = document.createElement('canvas');
            let ctx = mycanvas.getContext('2d');

            // Create an image
            let img = new Image();

            // Once the image loads, render the img on the canvas
            img.onload = function () {
                // Update dimensions of the canvas with the dimensions of the image
                mycanvas.width = this.width;
                mycanvas.height = this.height;

                // Draw the image
                ctx.drawImage(img, 0, 0);

                // Execute callback with the base64 URI of the image
                if (typeof (callback) == 'function') {
                    callback(mycanvas.toDataURL(
                        (imageFormat || 'image/png'),
                    ));
                }
            };

            // Crossbrowser support for URL
            let URLObj = window.URL || window.webkitURL;

            // Creates a DOMString containing a URL representing the object given in the parameter
            // namely the original Blob
            img.src = URLObj.createObjectURL(blob);
        }
    }

    window.addEventListener('paste', function (e) {
        // Handle the event
        retrieveImageFromClipboardAsBase64(e, function (imageDataBase64) {
            // If there's an image, open it in the browser as a new window :)
            if (!(selectedContactId > 0 || selectedContactId != '')) {
                return false;
            }
            if (imageDataBase64) {
                let template = $.templates('#copyPastImgTmplt');
                let imgHtml = template.render({ 'url': imageDataBase64 });
                $('#imageCanvas').append(imgHtml);
                $('#copyImageModal').modal('show');
            }
        });
    }, false);

    $(document).on('click', '#sendImages', function (e) {
        let imagesArr = [];
        let imagesArrHtml = $('#imageCanvas').find('.img-thumbnail');
        $.each(imagesArrHtml, function (index, value) {
            imagesArr.push($(this).attr('src'));
        });

        let data = {
            'to_id': selectedContactId,
            'message_type': 1,
            'images': imagesArr,
            'is_group': $('.chat__person-box--active').data('is_group'),
        };
        $.ajax({
            type: 'POST',
            url: imageUploadURL,
            data: data,
            success: function (data) {
                $.each(data.data, (index, value) => {
                    setSentOrReceivedMessage(value);
                });
                resetImageCanvas();
                $('#copyImageModal').modal('hide');
            },
            error: function (error) {
                displayToastr('Error', 'error', error.responseJSON.message);
            },
        });
    });

    $(document).on('click', '.remove-img', function (e) {
        $(this).parent().remove();
    });

    $('#copyImageModal').on('hidden.bs.modal', function () {
        resetImageCanvas();
    });

    window.resetImageCanvas = function () {
        $('#imageCanvas').html('');
    };
});

//Dropzon code
let myDropzone = '';
let sendMsgFiles = [];
$('#submit-all').hide();
$('#cancel-upload-file').hide();
window.Dropzone.options.dropzone = {
    thumbnailWidth: 125,
    acceptedFiles: 'image/*,.pdf,.doc,.docx,.xls,.xlsx,.mp4,.mkv,.avi,.txt,.mp3,.ogg,.wav,.aac,.alac',
    timeout: 50000,
    autoProcessQueue: false,
    parallelUploads: 10, // Number of files process at a time (default 2)
    addRemoveLinks: true,
    dictRemoveFile: '<i class="fa fa-trash-o" title="Remove" style="color: indianred;"></i>',
    uploadMultiple: true,
    init: function () {
        let submitButton = document.querySelector('#submit-all');
        let cancelButton = document.querySelector('#cancel-upload-file');
        myDropzone = this; // closure

        submitButton.addEventListener('click', function () {
            $('.dz-progress').show();
            myDropzone.processQueue(); // Tell Dropzone to process all queued files.
        });

        cancelButton.addEventListener('click', function () {
            myDropzone.removeAllFiles(true);
            $('#fileUpload').modal('toggle');
        });

        // show the submit button only when files are dropped here:
        this.on('addedfile', function () {
            $('#submit-all,#cancel-upload-file').show();
            $('.dz-progress').hide();
        });

        this.on('removedfile', function () {
            if (this.getQueuedFiles().length === 0) {
                $('#submit-all,#cancel-upload-file').hide();
            }
        });
    },
    complete: function (file) {
        if (this.getQueuedFiles().length > 0) {
            this.processQueue();
        }
        this.files.push(file);
        this.on('queuecomplete', function () {
            $('#fileUpload').modal('toggle');
            this.removeAllFiles(true);
            sendMsgFiles = [];
        });
    },
    success: function (file, response) {
        $.each(response.data, function (index, value) {
            let toId = $('#toId').val();
            let isGroup = $('.chat__person-box--active').data('is_group');
            let data = {
                to_id: toId,
                message: value.attachment,
                message_type: value.message_type,
                file_name: value.file_name,
                is_group: (isGroup) ? 1 : 0,
            };
            if ($.inArray(value.unique_code, sendMsgFiles) === -1) {
                storeMessage(data);
                sendMsgFiles.push(value.unique_code);
            }
        });
    },
    error: function (file, response) {
        if (typeof response === 'object') {
            response = (response.hasOwnProperty('message'))
                ? response.message
                : 'There is some error, Please try after some time';
        }
        displayToastr('Error', 'error', response);
        let fileRef;

        return (fileRef = file.previewElement) != null ?
            fileRef.parentNode.removeChild(file.previewElement) : void 0;
    },
};

$('#fileUpload').on('hidden.bs.modal', function () {
    $('#submit-all,#cancel-upload-file').hide();
    myDropzone.removeAllFiles(true);
});

$(document).on('mouseleave', '.chat__person-box', function () {
    $('.more-btn-conversation-item').removeClass('show');
});
