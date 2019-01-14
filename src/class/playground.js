/**
 * Playground is block construct area.
 * @fileoverview This manage playground.
 */
'use strict';

import EntryTool from 'entry-tool';

const Entry = require('../entry');

/**
 * Class for a playground.
 * This manage all view related with block.
 * @constructor
 */
Entry.Playground = class {
    constructor() {
        this.isTextBGMode_ = false;
        this.enableArduino = false;

        /**
         * playground's current view type
         * View types are 'default', 'code', 'picture', 'text', sound'
         * @type {string}
         */
        this.viewMode_ = 'default';
        Entry.addEventListener('textEdited', () => {
            this.injectText();
        });
        Entry.addEventListener('hwChanged', () => {
            this.updateHW();
        });
        Entry.addEventListener('commentVisibleChanged', this.toggleCommentButtonVisible.bind(this));
    }

    setMode(mode) {
        this.mainWorkspace.setMode(mode);
    }

    /**
     * Control bar view generator.
     * @param {!Element} playgroundView playgroundView from Entry.
     * @param {?string} option for choose type of view.
     */
    generateView(playgroundView, option = 'workspace') {
        /** @type {!Element} */
        this.view_ = playgroundView;
        this.view_.addClass('entryPlayground');
        if (option === 'workspace') {
            this.view_.addClass('entryPlaygroundWorkspace');

            const tabView = Entry.createElement('div', 'entryCategoryTab')
                .addClass('entryPlaygroundTabWorkspace')
                .appendTo(this.view_);
            this.generateTabView(tabView);
            this.tabView_ = tabView;

            const tabButtonView = Entry.createElement('div', 'entryButtonTab')
                .addClass('entryPlaygroundButtonTabWorkspace')
                .appendTo(this.view_);
            this.createButtonTabView(tabButtonView);
            this.tabButtonView_ = tabButtonView;

            const curtainView = Entry.createElement('div', 'entryCurtain')
                .addClass('entryPlaygroundCurtainWorkspace entryRemove')
                .appendTo(this.view_);
            const [mentHead, mentTail = ''] = Lang.Workspace.cannot_edit_click_to_stop.split('.');
            curtainView.innerHTML = `${mentHead}.<br/>${mentTail}`;
            curtainView.addEventListener('click', function() {
                Entry.engine.toggleStop();
            });
            this.curtainView_ = curtainView;

            const pictureView = Entry.createElement('div', 'entryPicture')
                .addClass('entryPlaygroundPictureWorkspace entryRemove')
                .appendTo(this.view_);
            this.generatePictureView(pictureView);
            this.pictureView_ = pictureView;

            const textView = Entry.createElement('div', 'entryText')
                .addClass('entryPlaygroundTextWorkspace entryRemove')
                .appendTo(this.view_);
            this.generateTextView(textView);
            this.textView_ = textView;

            const soundView = Entry.createElement('div', 'entrySound')
                .addClass('entryPlaygroundSoundWorkspace entryRemove')
                .appendTo(this.view_);
            this.generateSoundView(soundView);
            this.soundView_ = soundView;

            const defaultView = Entry.createElement('div', 'entryDefault')
                .addClass('entryPlaygroundDefaultWorkspace')
                .appendTo(this.view_);
            this.generateDefaultView(defaultView);
            this.defaultView_ = defaultView;

            //Code view must be append at last.
            const codeView = Entry.createElement('div', 'entryCode')
                .addClass('entryPlaygroundCodeWorkspace entryRemove')
                .appendTo(this.view_);
            this.generateCodeView(codeView);
            this.codeView_ = codeView;

            const resizeHandle = Entry.createElement('div')
                .addClass('entryPlaygroundResizeWorkspace', 'entryRemove')
                .appendTo(this.view_);
            this.resizeHandle_ = resizeHandle;
            this.initializeResizeHandle(resizeHandle);

            /** @type {!Element} */
            this.codeView_ = codeView;

            Entry.addEventListener('run', () => {
                Entry.playground.curtainView_.removeClass('entryRemove');
            });
            Entry.addEventListener('stop', () => {
                Entry.playground.curtainView_.addClass('entryRemove');
            });
            this.applyTabOption();
        }
    }

    /**
     * Generate default view.
     * default view is shown when object is not selected.
     * @param {!Element} defaultView
     * @return {Element}
     */
    generateDefaultView(defaultView) {
        return defaultView;
    }

    /**
     * generate tab menus
     * @param {!Element} tabView
     * @return {Element}
     */
    generateTabView(tabView) {
        const that = this;
        const tabList = Entry.createElement('ul').addClass('entryTabListWorkspace');
        this.tabList_ = tabList;
        tabView.appendChild(tabList);

        this.tabViewElements = {};
        const codeTab = Entry.createElement('li', 'entryCodeTab')
            .addClass('entryTabListItemWorkspace entryTabSelected')
            .bindOnClick(() => {
                Entry.do('playgroundChangeViewMode', 'code', that.selectedViewMode);
            })
            .appendTo(tabList);
        codeTab.innerHTML = Lang.Workspace.tab_code;
        this.tabViewElements.code = codeTab;
        this._codeTab = codeTab;

        const pictureTab = Entry.createElement('li', 'entryPictureTab')
            .addClass('entryTabListItemWorkspace')
            .bindOnClick(() => {
                Entry.do('playgroundChangeViewMode', 'picture', that.selectedViewMode);
            })
            .appendTo(tabList);
        pictureTab.innerHTML = Lang.Workspace.tab_picture;
        this.tabViewElements.picture = pictureTab;
        this.pictureTab = pictureTab;

        const textboxTab = Entry.createElement('li', 'entryTextboxTab')
            .addClass('entryTabListItemWorkspace entryRemove')
            .appendTo(tabList)
            .bindOnClick(() => {
                Entry.do('playgroundChangeViewMode', 'text', that.selectedViewMode);
            });
        textboxTab.innerHTML = Lang.Workspace.tab_text;
        this.tabViewElements.text = textboxTab;
        this.textboxTab = textboxTab;

        const soundTab = Entry.createElement('li', 'entrySoundTab')
            .addClass('entryTabListItemWorkspace')
            .appendTo(tabList)
            .bindOnClick(() => {
                Entry.do('playgroundChangeViewMode', 'sound', that.selectedViewMode);
            });
        soundTab.innerHTML = Lang.Workspace.tab_sound;
        this.tabViewElements.sound = soundTab;
        this.soundTab = soundTab;

        const variableTab = Entry.createElement('li', 'entryVariableTab')
            .addClass('entryTabListItemWorkspace entryVariableTabWorkspace')
            .appendTo(tabList)
            .bindOnClick(() => {
                Entry.do('playgroundChangeViewMode', 'variable', that.selectedViewMode);
            });
        variableTab.innerHTML = Lang.Workspace.tab_attribute;
        this.tabViewElements.variable = variableTab;
        this.variableTab = variableTab;
    }

    createButtonTabView(tabButtonView) {
        const commentToggleButton = Entry.createElement('div')
            .addClass('entryPlaygroundCommentButtonWorkspace showComment')
            .appendTo(tabButtonView);
        commentToggleButton.setAttribute('alt', Lang.Blocks.show_all_comment);
        commentToggleButton.setAttribute('title', Lang.Blocks.show_all_comment);

        this.commentToggleButton_ = commentToggleButton;
        commentToggleButton.bindOnClick(() => {
            this.toggleCommentButton();
        });
    }

    toggleCommentButton() {
        if (this.board.isVisibleComment) {
            Entry.do('hideAllComment', this.board);
        } else {
            Entry.do('showAllComment', this.board);
        }
        this.toggleCommentButtonVisible();
    }

    toggleCommentButtonVisible() {
        const button = this.commentToggleButton_;

        if (this.board.isVisibleComment) {
            button.addClass('showComment');
            button.setAttribute('alt', Lang.Blocks.show_all_comment);
            button.setAttribute('title', Lang.Blocks.show_all_comment);
        } else {
            button.removeClass('showComment');
            button.setAttribute('alt', Lang.Blocks.hide_all_comment);
            button.setAttribute('title', Lang.Blocks.hide_all_comment);
        }
    }

    /**
     * Inject and generate code view
     * @param {!Element} codeView
     * @return {Element}
     */
    generateCodeView(codeView) {
        const variableView = this.createVariableView();
        codeView.appendChild(variableView);
        this.variableView_ = variableView;

        codeView = Entry.Dom(codeView);
        const boardView = Entry.Dom('div', {
            parent: codeView,
            id: 'entryWorkspaceBoard',
            class: 'entryWorkspaceBoard',
        });

        const blockMenuView = Entry.Dom('div', {
            parent: codeView,
            id: 'entryWorkspaceBlockMenu',
            class: 'entryWorkspaceBlockMenu',
        });

        const initOpts = {
            blockMenu: {
                dom: blockMenuView,
                align: 'LEFT',
                categoryData: EntryStatic.getAllBlocks(),
                scroll: true,
            },
            board: {
                dom: boardView,
            },
            readOnly: Entry.readOnly,
        };
        if (Entry.textCodingEnable) {
            initOpts.vimBoard = { dom: boardView };
        }

        this.mainWorkspace = new Entry.Workspace(initOpts);
        this.blockMenu = this.mainWorkspace.blockMenu;
        this.board = this.mainWorkspace.board;
        this.blockMenu.banClass('checker');
        this.banExpansionBlock();
        this.vimBoard = this.mainWorkspace.vimBoard;

        if (Entry.hw) {
            this.updateHW();
        }
    }

    /**
     * Generate picture view.
     * @param {!Element} pictureView
     * @return {Element}
     */
    generatePictureView(PictureView) {
        if (Entry.type === 'workspace') {
            const pictureAdd = Entry.createElement('div', 'entryAddPicture')
                .addClass('entryPlaygroundAddPicture')
                .appendTo(PictureView);

            const innerPictureAdd = Entry.createElement('div', 'entryAddPictureInner')
                .addClass('entryPlaygroundAddPictureInner')
                .bindOnClick(() => {
                    if (!Entry.container || Entry.container.isSceneObjectsExist()) {
                        Entry.do('playgroundClickAddPicture');
                    } else {
                        Entry.toast.alert(
                            Lang.Workspace.add_object_alert,
                            Lang.Workspace.add_object_alert_msg
                        );
                    }
                })
                .appendTo(pictureAdd);
            innerPictureAdd.innerHTML = Lang.Workspace.picture_add;
            this._pictureAddButton = innerPictureAdd;

            this.pictureListView_ = Entry.createElement('ul', 'entryPictureList')
                .addClass('entryPlaygroundPictureList')
                .appendTo(PictureView);

            this.painter = new Entry.Painter(
                Entry.createElement('div', 'entryPainter')
                    .addClass('entryPlaygroundPainter')
                    .appendTo(PictureView)
            );
        }
    }

    initSortablePictureWidget() {
        if (this.pictureSortableListWidget) {
            return;
        }

        this.pictureSortableListWidget = new EntryTool({
            type: 'sortableWidget',
            data: {
                height: '100%',
                sortableTarget: ['entryPlaygroundPictureThumbnail'],
                lockAxis: 'y',
                items: this._getSortablePictureList(),
            },
            container: this.pictureListView_,
        }).on('change', ([newIndex, oldIndex]) => {
            Entry.playground.movePicture(newIndex, oldIndex);
        });
    }

    updatePictureView() {
        if (this.pictureSortableListWidget) {
            this.pictureSortableListWidget.setData({
                items: this._getSortablePictureList(),
            });
        }
    }

    _getSortablePictureList() {
        if (!this.object || !this.object.pictures) {
            return [];
        }

        return this.object.pictures.map((value) => {
            return {
                key: value.id,
                item: value.view,
            };
        });
    }

    /**
     * Generate text view.
     * @param {!Element} textView
     * @return {Element}
     */
    generateTextView(textView) {
        const that = this;
        const wrap = Entry.createElement('div')
            .addClass('write_box')
            .appendTo(textView);
        const writeSet = Entry.createElement('div').addClass('write_set');
        const inputArea = Entry.createElement('div').addClass('input_box');
        wrap.appendChild(writeSet);
        wrap.appendChild(inputArea);

        //write set 글 속성 탭
        const fontSelect = Entry.createElement('div').addClass('pop_selectbox');
        const fontLink = Entry.createElement('a', 'entryTextBoxAttrFontName').addClass(
            'select_link imico_pop_select_arr_down'
        );
        fontLink.bindOnClick(() => {
            const options = EntryStatic.fonts.map((font) => {
                return [font.name, font];
            });
            fontLink.addClass('imico_pop_select_arr_up');
            fontLink.removeClass('imico_pop_select_arr_down');
            this.openDropDown(
                options,
                fontLink,
                (value) => {
                    let font = value[1];
                    let textValue = textEditInput.value;
                    if (that.object.entity.getLineBreak()) {
                        textValue = textEditArea.value;
                    }

                    if (/[\u4E00-\u9FFF]/.exec(textValue) != null) {
                        font = options[0][1];
                        entrylms.alert(Lang.Menus.not_supported_text);
                    }
                    fontLink.innerText = font.name;
                    $('#entryTextBoxAttrFontName').data('font', font);
                    this.object.entity.setFontType(font.family);
                },
                () => {
                    fontLink.removeClass('imico_pop_select_arr_up');
                    fontLink.addClass('imico_pop_select_arr_down');
                }
            );
        });
        fontSelect.appendChild(fontLink);
        writeSet.appendChild(fontSelect);

        //스타일 박스
        const alignBox = Entry.createElement('div').addClass('font_style_box');
        writeSet.appendChild(alignBox);

        const alignLeft = Entry.createElement('a')
            .addClass('style_link imbtn_pop_font_align_left')
            .bindOnClick(() => {
                Entry.playground.setFontAlign(Entry.TEXT_ALIGN_LEFT);
            });
        alignLeft.setAttribute("title", Lang.Workspace.align_left);
        alignBox.appendChild(alignLeft);
        this.alignLeftBtn = alignLeft;
        const alignMiddle = Entry.createElement('a')
            .addClass('style_link imbtn_pop_font_align_middle')
            .bindOnClick(() => {
                Entry.playground.setFontAlign(Entry.TEXT_ALIGN_CENTER);
            });
        alignMiddle.setAttribute("title", Lang.Workspace.align_center);
        alignBox.appendChild(alignMiddle);
        this.alignCenterBtn = alignMiddle;
        const alignRight = Entry.createElement('a')
            .addClass('style_link imbtn_pop_font_align_right')
            .bindOnClick(() => {
                Entry.playground.setFontAlign(Entry.TEXT_ALIGN_RIGHT);
            });
        alignRight.setAttribute("title", Lang.Workspace.align_right);
        alignBox.appendChild(alignRight);
        this.alignRightBtn = alignRight;

        const styleBox = Entry.createElement('div').addClass('font_style_box');
        writeSet.appendChild(styleBox);

        const bold = Entry.createElement('a')
            .addClass('style_link imbtn_pop_font_bold')
            .bindOnClick((e) => {
                $(e.currentTarget).toggleClass('on');
                Entry.playground.object.entity.toggleFontBold();
                $(this.textEditArea).toggleClass('bold');
                $(this.textEditInput).toggleClass('bold');
            });
        bold.setAttribute("title", Lang.Workspace.bold);
        styleBox.appendChild(bold);

        const underLine = Entry.createElement('a')
            .addClass('style_link imbtn_pop_font_underline')
            .bindOnClick((e) => {
                const underLineState = !Entry.playground.object.entity.getUnderLine() || false;
                $(e.currentTarget).toggleClass('on');
                Entry.playground.object.entity.setUnderLine(underLineState);

                const effect = `${underLineState ? "underline" : ""} ${Entry.playground.object.entity.getStrike() ? "line-through" : ""}`.trim();
                this.textEditArea.style.textDecoration = effect;
                this.textEditInput.style.textDecoration = effect;
            });
        underLine.setAttribute("title", Lang.Workspace.font_underline);
        styleBox.appendChild(underLine);

        const italic = Entry.createElement('a')
            .addClass('style_link imbtn_pop_font_italic')
            .bindOnClick((e) => {
                $(e.currentTarget).toggleClass('on');
                Entry.playground.object.entity.toggleFontItalic();
                $(this.textEditArea).toggleClass('italic');
                $(this.textEditInput).toggleClass('italic');
            });
        italic.setAttribute("title", Lang.Workspace.font_tilt);
        styleBox.appendChild(italic);

        const through = Entry.createElement('a')
            .addClass('style_link imbtn_pop_font_through')
            .bindOnClick((e) => {
                $(e.currentTarget).toggleClass('on');
                const strikeState = !Entry.playground.object.entity.getStrike() || false;
                Entry.playground.object.entity.setStrike(strikeState);

                const effect = `${strikeState ? "line-through" : ""} ${Entry.playground.object.entity.getUnderLine() ? "underline" : ""}`.trim();
                this.textEditArea.style.textDecoration = effect;
                this.textEditInput.style.textDecoration = effect;
            });
        through.setAttribute("title", Lang.Workspace.font_cancel);
        styleBox.appendChild(through);

        const color = Entry.createElement('a').addClass('style_link imbtn_pop_font_color');
        color.bindOnClick(() => {
            return this.openColourPicker(
                color,
                this.object.entity.getColour(),
                false,
                this.setTextColour.bind(this)
            );
        });
        color.setAttribute("title", Lang.Workspace.font_color);
        styleBox.appendChild(color);

        const backgroundColor = Entry.createElement('a').addClass(
            'style_link imbtn_pop_font_backgroundcolor'
        );
        backgroundColor.setAttribute("title", Lang.Workspace.font_fill);
        backgroundColor.bindOnClick(() => {
            return this.openColourPicker(
                backgroundColor,
                this.object.entity.getBGColour(),
                true,
                this.setBackgroundColour.bind(this)
            );
        });
        styleBox.appendChild(backgroundColor);

        const writeTypeBox = Entry.createElement('div').addClass('write_type_box');
        const singleLine = Entry.createElement('a');
        singleLine.innerText = Lang.Buttons.single_line;
        singleLine.bindOnClick(() => {
            return Entry.playground.toggleLineBreak(false);
        });
        const multiLine = Entry.createElement('a');
        multiLine.innerText = Lang.Buttons.multi_line;
        multiLine.bindOnClick(() => {
            return Entry.playground.toggleLineBreak(true);
        });
        writeTypeBox.appendChild(singleLine);
        writeTypeBox.appendChild(multiLine);
        inputArea.appendChild(writeTypeBox);

        //글자 크기 조절 슬라이드.
        const fontSizeWrapper = Entry.createElement('div').addClass(
            'entryPlaygroundFontSizeWrapper multi'
        );
        inputArea.appendChild(fontSizeWrapper);
        this.fontSizeWrapper = fontSizeWrapper;

        const fontSizeLabel = Entry.createElement('div').addClass('entryPlaygroundFontSizeLabel');
        fontSizeLabel.innerHTML = Lang.General.font_size;
        fontSizeWrapper.appendChild(fontSizeLabel);

        const fontSizeSlider = Entry.createElement('div').addClass('entryPlaygroundFontSizeSlider');
        fontSizeWrapper.appendChild(fontSizeSlider);

        const fontSizeIndiciator = Entry.createElement('div').addClass(
            'entryPlaygroundFontSizeIndicator'
        );
        fontSizeSlider.appendChild(fontSizeIndiciator);
        this.fontSizeIndiciator = fontSizeIndiciator;

        const fontSizeKnob = Entry.createElement('div').addClass('entryPlaygroundFontSizeKnob');
        fontSizeSlider.appendChild(fontSizeKnob);
        this.fontSizeKnob = fontSizeKnob;

        $(fontSizeKnob).bind('mousedown.fontKnob touchstart.fontKnob', function() {
            const resizeOffset = $(fontSizeSlider).offset().left;

            const doc = $(document);
            doc.bind('mousemove.fontKnob touchmove.fontKnob', onMouseMove);
            doc.bind('mouseup.fontKnob touchend.fontKnob', onMouseUp);

            function onMouseMove(e) {
                let x = e.pageX;
                if(!x) {
                    x = e.originalEvent.touches[0].pageX;
                }
                let left = x - resizeOffset;
                left = Math.max(left, 5);
                left = Math.min(left, 136);
                fontSizeKnob.style.left = `${left}px`;
                left /= 1.36;
                fontSizeIndiciator.style.width = `${left}%`;
                Entry.playground.object.entity.setFontSize(left);
            }

            function onMouseUp() {
                $(document).unbind('.fontKnob');
            }
        });

        const inputInner = Entry.createElement('div').addClass('input_inner');
        inputArea.appendChild(inputInner);

        const textEditInput = Entry.createElement('input').addClass(
            'entryPlayground_textBox single'
        );
        textEditInput.type = 'text';
        textEditInput.placeholder = Lang.Workspace.textbox_input;
        const textChangeApply = function() {
            const object = Entry.playground.object;
            const entity = object.entity;
            const selected = $('#entryTextBoxAttrFontName').data('font');
            const defaultFont = EntryStatic.fonts[0];
            if (selected.family === 'Nanum Pen Script' || selected.family === 'Jeju Hallasan') {
                if (/[\u4E00-\u9FFF]/.exec(this.value) != null) {
                    $('#entryTextBoxAttrFontName').text(defaultFont.name);
                    entity.setFontType(defaultFont.family);
                    entrylms.alert(Lang.Menus.not_supported_text);
                }
            }
            object.setText(this.value);
            entity.setText(this.value);
        };
        textEditInput.onkeyup = textChangeApply;
        textEditInput.onchange = textChangeApply;

        textEditInput.addEventListener('focusin', function() {
            textEditInput.prevText = textEditInput.value;
        });
        textEditInput.onblur = function() {
            if (textEditInput.value !== textEditInput.prevText) {
                Entry.do('editText', textEditInput.value, textEditInput.prevText);
            }
            // Entry.dispatchEvent('textEdited');
        };
        this.textEditInput = textEditInput;
        inputInner.appendChild(textEditInput);

        const textEditArea = Entry.createElement('textarea');
        textEditArea.placeholder = Lang.Workspace.textbox_input;
        textEditArea.addClass('entryPlayground_textArea multi');
        textEditArea.style.display = 'none';
        textEditArea.onkeyup = textChangeApply;
        textEditArea.onchange = textChangeApply;

        textEditArea.addEventListener('focusin', function() {
            textEditArea.prevText = textEditArea.value;
        });
        textEditArea.onblur = function() {
            if (textEditArea.value !== textEditArea.prevText) {
                Entry.do('editText', textEditArea.value, textEditArea.prevText);
            }
        };
        this.textEditArea = textEditArea;
        inputInner.appendChild(textEditArea);

        const singleDesc = Entry.createElement('ul').addClass('list single');
        singleDesc.appendChild(Entry.createElement('li').text(Lang.Menus.linebreak_off_desc_1));
        singleDesc.appendChild(Entry.createElement('li').text(Lang.Menus.linebreak_off_desc_2));
        singleDesc.appendChild(Entry.createElement('li').text(Lang.Menus.linebreak_off_desc_3));

        const multiDesc = Entry.createElement('ul').addClass('list multi');
        multiDesc.appendChild(Entry.createElement('li').text(Lang.Menus.linebreak_on_desc_1));
        multiDesc.appendChild(Entry.createElement('li').text(Lang.Menus.linebreak_on_desc_2));
        multiDesc.appendChild(Entry.createElement('li').text(Lang.Menus.linebreak_on_desc_3));

        inputArea.appendChild(singleDesc);
        inputArea.appendChild(multiDesc);
    }

    /**
     * 소리 편집 기능 신규 개발시 해당 로직 삭제
     * @private
     */
    _createSoundEditView() {
        const soundEditView = Entry.createElement('div', 'entrySoundEdit').addClass(
            'entryPlaygroundSoundEdit'
        );

        const tempNotificationWrapper = Entry.createElement('div').addClass(
            'entryPlaygroundSoundEditWrapper'
        );

        const tempImage = Entry.createElement('div').addClass('entryPlaygroundSoundEditImage');

        const tempNotification = Entry.createElement('span').addClass(
            'entryPlaygroundSoundEditText'
        );
        tempNotification.innerHTML = Lang.Menus.sound_edit_warn;

        tempNotificationWrapper.appendChild(tempImage);
        tempNotificationWrapper.appendChild(tempNotification);

        soundEditView.appendChild(tempNotificationWrapper);

        return soundEditView;
    }

    /**
     * Generate sound view.
     * default view is shown when object is not selected.
     * @return {Element}
     * @param soundView
     */
    generateSoundView(soundView) {
        if (Entry.type == 'workspace') {
            const soundAdd = Entry.createElement('div', 'entryAddSound');
            soundAdd.addClass('entryPlaygroundAddSound');
            const innerSoundAdd = Entry.createElement('div', 'entryAddSoundInner').addClass(
                'entryPlaygroundAddSoundInner'
            );
            innerSoundAdd.bindOnClick(function() {
                if (!Entry.container || Entry.container.isSceneObjectsExist()) {
                    Entry.do('playgroundClickAddSound');
                } else {
                    Entry.toast.alert(
                        Lang.Workspace.add_object_alert,
                        Lang.Workspace.add_object_alert_msg
                    );
                }
            });
            innerSoundAdd.innerHTML = Lang.Workspace.sound_add;
            soundAdd.appendChild(innerSoundAdd);
            soundView.appendChild(soundAdd);
            const soundList = Entry.createElement('ul', 'entrySoundList')
                .addClass('entryPlaygroundSoundList');

            soundView.appendChild(soundList);
            this.soundListView_ = soundList;
            this._soundAddButton = innerSoundAdd;

            const soundEditView = this._createSoundEditView();
            soundView.appendChild(soundEditView);
        }
    }

    initSortableSoundWidget() {
        if (this.soundSortableListWidget) {
            return;
        }

        this.soundSortableListWidget = new EntryTool({
            type: 'sortableWidget',
            data: {
                height: '100%',
                sortableTarget: ['entryPlaygroundSoundThumbnail'],
                lockAxis: 'y',
                items: this._getSortableSoundList(),
            },
            container: this.soundListView_,
        }).on('change', ([newIndex, oldIndex]) => {
            Entry.playground.moveSound(newIndex, oldIndex);
        });
    }

    updateSoundsView() {
        if (this.soundSortableListWidget) {
            this.soundSortableListWidget.setData({
                items: this._getSortableSoundList(),
            });
        }
    }

    _getSortableSoundList() {
        if (!this.object || !this.object.sounds) {
            return [];
        }

        return this.object.sounds.map((value) => {
            return {
                key: value.id,
                item: value.view,
            };
        });
    }

    /**
     * Inject object
     * @param {?Entry.EntryObject} object
     */
    injectObject(object) {
        /** @type {Entry.Entryobject} */
        if (!object) {
            this.changeViewMode('code');
            this.object = null;
            return;
        }
        if (object === this.object) {
            return;
        }

        this.object = object;

        const objectType = object.objectType;
        this.setMenu(objectType);

        this.injectCode();

        const { text: textTab, picture: pictureTab } = this.tabViewElements;
        if (objectType === 'sprite' && Entry.pictureEditable) {
            if (textTab) {
                textTab.addClass('entryRemove');
            }
            if (pictureTab) {
                pictureTab.removeClass('entryRemove');
            }
        } else if (objectType === 'textBox') {
            if (pictureTab) {
                pictureTab.addClass('entryRemove');
            }
            if (textTab) {
                textTab.removeClass('entryRemove');
            }
        }

        const viewMode = this.viewMode_;
        if (viewMode === 'default') {
            this.changeViewMode('code');
        } else if (viewMode === 'variable') {
            this.changeViewMode('variable');
        } else if ((viewMode === 'picture' || viewMode === 'text') && objectType === 'textBox') {
            this.changeViewMode('text');
        } else if ((viewMode === 'text' || viewMode === 'picture') && objectType === 'sprite') {
            this.changeViewMode('picture');
        } else if (viewMode === 'sound') {
            this.changeViewMode('sound');
        }

        _.result(this.blockMenu, 'clearRendered');
        this.reloadPlayground();
    }

    /**
     * Inject code
     */
    injectCode() {
        const workspace = Entry.getMainWS();
        if (!workspace) {
            return;
        }

        const object = this.object;
        const vimBoard = workspace.vimBoard;

        if (vimBoard && Entry.textCodingEnable && !vimBoard._parser._onError) {
            vimBoard._changedObject = object;
            vimBoard._currentScene = object.scene;
        }

        const board = workspace.getBoard();
        const engine = Entry.engine;
        workspace.changeBoardCode(
            object.script,
            engine && engine.isState('run') ? undefined : board.adjustThreadsPosition.bind(board)
        );
    }

    /**
     * Inject picture
     */
    injectPicture() {
        const view = this.pictureListView_;
        if (!view) {
            return;
        }

        if (!this.object) {
            return Entry.dispatchEvent('pictureClear');
        }

        (this.object.pictures || []).forEach((picture, i) => {
            !picture.view && Entry.playground.generatePictureElement(picture);
            const element = picture.view;
            element.orderHolder.innerHTML = i + 1;
        });

        this.selectPicture(this.object.selectedPicture);
        this.updatePictureView();
    }

    /**
     * Add picture
     * @param {picture model} picture
     */
    addPicture(picture, isNew) {
        const tempPicture = _.clone(picture);

        if (isNew === true) {
            delete tempPicture.id;
        }
        delete tempPicture.view;

        picture = Entry.Utils.copy(tempPicture);
        if (!picture.id) {
            picture.id = Entry.generateHash();
        }

        picture.name = Entry.getOrderedName(picture.name, this.object.pictures);

        this.generatePictureElement(picture);

        Entry.do('objectAddPicture', picture.objectId || this.object.id, picture);
        this.injectPicture();
        this.selectPicture(picture);
    }

    /**
     * set picture
     * @param {picture}
     */
    setPicture(picture) {
        const element = Entry.container.getPictureElement(picture.id, picture.objectId);
        const $element = $(element);
        if (element) {
            picture.view = element;
            element.picture = picture;

            const thumbnailView = $element.find(`#t_${picture.id}`)[0];
            if (picture.fileurl) {
                thumbnailView.style.backgroundImage = `url("${picture.fileurl}")`;
            } else {
                // deprecated
                const fileName = picture.filename;
                thumbnailView.style.backgroundImage = `url("${
                    Entry.defaultPath
                }/uploads/${fileName.substring(0, 2)}/${fileName.substring(
                    2,
                    4
                )}/thumb/${fileName}.png")`;
            }
            const sizeView = $element.find(`#s_${picture.id}`)[0];
            sizeView.innerHTML = `${picture.dimension.width} X ${picture.dimension.height}`;
        }

        Entry.container.setPicture(picture);
        // Entry.playground.object.setPicture(picture);
    }

    /**
     * Download a picture
     * @param {!String} pictureId
     */
    downloadPicture(pictureId) {
        const picture = Entry.playground.object.getPicture(pictureId);
        if (picture.fileurl) {
            window.open(
                `/api/sprite/download/entryjs/${btoa(picture.fileurl)}/${encodeURIComponent(
                    picture.name
                )}.png`
            );
        } else {
            window.open(
                `/api/sprite/download/image/${btoa(picture.filename)}/${encodeURIComponent(
                    picture.name
                )}.png`
            );
        }
    }

    /**
     * Clone picture
     * @param {!String} pictureId
     */
    clonePicture(pictureId) {
        const sourcePicture = Entry.playground.object.getPicture(pictureId);
        this.addPicture(sourcePicture, true);
    }

    /**
     * Select picture
     * @param {picture}
     */
    selectPicture(picture) {
        const pictures = this.object.pictures;
        for (let i = 0, len = pictures.length; i < len; i++) {
            const target = pictures[i];
            const view = target.view;
            if (target.id === picture.id) {
                view.addClass('entryPictureSelected');
            } else {
                view.removeClass('entryPictureSelected');
            }
        }

        let objectId_;
        if (picture && picture.id) {
            objectId_ = Entry.container.selectPicture(picture.id, picture.objectId);
        }

        if (this.object.id === objectId_) {
            if (!picture.objectId) {
                picture.objectId = this.object.id;
            }
            Entry.dispatchEvent('pictureSelected', picture);
        }
    }

    /**
     * Move picture in this.object.pictures
     * this method is for sortable
     * @param {!number} start
     * @param {!number} end
     */
    movePicture(start, end) {
        this.object.pictures.splice(end, 0, this.object.pictures.splice(start, 1)[0]);
        this.injectPicture();
    }

    /**
     * Inject text
     */
    injectText() {
        const object = this.object;

        if (!object) {
            return;
        }

        const entity = object.entity;

        const text = entity.getText();
        this.textEditInput.value = text;
        this.textEditArea.value = text;

        const font = EntryStatic.fonts.find((font) => {
            return font.family === entity.getFontName();
        });
        if (font) {
            $('#entryText #entryTextBoxAttrFontName').text(font.name);
            $('#entryText #entryTextBoxAttrFontName').data('font', font);
        }

        $('.style_link.imbtn_pop_font_bold').toggleClass('on', entity.fontBold);
        $('.style_link.imbtn_pop_font_italic').toggleClass('on', entity.fontItalic);
        $('.style_link.imbtn_pop_font_underline').toggleClass('on', entity.getUnderLine());
        $('.style_link.imbtn_pop_font_through').toggleClass('on', entity.getStrike());

        if (entity.colour) {
            this.setTextColour(entity.colour, true);
        }
        if (entity.bgColor) {
            this.setBackgroundColour(entity.bgColor, true);
        }

        this.toggleLineBreak(entity.getLineBreak());

        if (entity.getLineBreak()) {
            const LANG = Lang.Menus;
            $('.entryPlaygroundLinebreakDescription > p').html(LANG.linebreak_on_desc_1);
            const pDoms = $('.entryPlaygroundLinebreakDescription > ul > li');
            pDoms.eq(0).text(LANG.linebreak_on_desc_2);
            pDoms.eq(1).text(LANG.linebreak_on_desc_3);
            this._setFontFontUI();
        }

        this.setFontAlign(entity.getTextAlign());
    }

    _setFontFontUI() {
        const fontSize = this.object.entity.getFontSize();
        this.fontSizeIndiciator.style.width = `${fontSize}%`;
        this.fontSizeKnob.style.left = `${fontSize * 1.36}px`;
    }

    /**
     * Inject sound
     */
    injectSound() {
        const view = this.soundListView_;
        if (!view || !this.object) {
            return;
        }

        (this.object.sounds || []).forEach((sound, i) => {
            !sound.view && Entry.playground.generateSoundElement(sound);
            const element = sound.view;
            element.orderHolder.innerHTML = i + 1;
        });

        this.updateSoundsView();
    }

    /**
     * Move sound in this.object.sounds
     * this method is for sortable
     * @param {!number} start
     * @param {!number} end
     */
    moveSound(start, end) {
        if (this.object.sounds) {
            this.object.sounds.splice(end, 0, this.object.sounds.splice(start, 1)[0]);
            this.injectSound();
        }
    }

    addExpansionBlock(block, isNew) {
        const tempBlock = _.clone(block);
        delete tempBlock.view;
        if (isNew === true) {
            delete tempBlock.id;
        }

        block = Entry.Utils.copy(tempBlock);

        if (!block.id) {
            block.id = Entry.generateHash();
        }

        Entry.do('objectAddExpansionBlock', block);
    }
    /**
     * Add sound
     * @param {sound model} sound
     * @param {boolean} NotForView if this is true, add element into object also.
     */
    addSound(sound, NotForView, isNew) {
        const tempSound = _.clone(sound);
        delete tempSound.view;
        if (isNew === true) {
            delete tempSound.id;
        }

        sound = Entry.Utils.copy(tempSound);
        if (!sound.id) {
            sound.id = Entry.generateHash();
        }
        sound.name = Entry.getOrderedName(sound.name, this.object.sounds);

        this.generateSoundElement(sound);
        Entry.do('objectAddSound', this.object.id, sound);
        this.injectSound();
    }

    downloadSound(soundId) {
        const sound = Entry.playground.object.getSound(soundId);
        if (sound.fileurl) {
            if (sound.fileurl.indexOf('bark.mp3') > -1) {
                window.open(
                    `/api/sprite/download/entryjs/${btoa(sound.fileurl)}/${encodeURIComponent(
                        `${sound.name}.mp3`
                    )}`
                );
            } else {
                window.open(sound.fileurl);
            }
        } else {
            window.open(
                `/api/sprite/download/sound/${encodeURIComponent(
                    sound.filename
                )}/${encodeURIComponent(sound.name)}`
            );
        }
    }

    /**
     * select view mode
     * @param {string} viewType
     */
    changeViewMode(viewType) {
        for (const i in this.tabViewElements) {
            this.tabViewElements[i].removeClass('entryTabSelected');
        }
        if (viewType !== 'default') {
            this.tabViewElements[viewType].addClass('entryTabSelected');
        }
        if (viewType === 'variable') {
            Entry.playground.toggleOnVariableView();
            this.tabViewElements.code.removeClass('entryTabSelected');
            this.tabViewElements[viewType].addClass('entryTabSelected');
            return;
        }
        const views = this.view_.children;
        for (let i = 0; i < views.length; i++) {
            const view = views[i];
            if (view.id.toUpperCase().indexOf(viewType.toUpperCase()) > -1) {
                view.removeClass('entryRemove');
            } else {
                view.addClass('entryRemove');
            }
        }

        if (Entry.pictureEditable) {
            if (viewType === 'picture') {
                this.painter.show();
                this.initSortablePictureWidget();
                if (!this.pictureView_.object || this.pictureView_.object != this.object) {
                    this.pictureView_.object = this.object;
                    this.injectPicture();
                } else if (
                    this.object &&
                    this.pictureListView_ &&
                    !this.pictureListView_.hasChildNodes()
                ) {
                    const pictures = this.object.pictures;
                    if (pictures && pictures.length) {
                        this.injectPicture();
                    }
                }
            } else {
                this.painter.hide();
            }
        }

        if (viewType === 'sound') {
            this.initSortableSoundWidget();
            if (!this.soundView_.object || this.soundView_.object != this.object) {
                this.soundView_.object = this.object;
                this.injectSound();
            } else if (this.object && this.soundListView_ && !this.soundListView_.hasChildNodes()) {
                const sounds = this.object.sounds;
                if (sounds && sounds.length) {
                    this.injectSound();
                }
            }
        }

        if (
            (viewType === 'text' && this.object.objectType === 'textBox') ||
            this.textView_.object != this.object
        ) {
            this.textView_.object = this.object;
            this.injectText();
        }

        if (viewType === 'code') {
            this.resizeHandle_ && this.resizeHandle_.removeClass('entryRemove');
            this.tabButtonView_ && this.tabButtonView_.addClass('entryCode');
            this.blockMenu.reDraw();
        } else {
            this.tabButtonView_ && this.tabButtonView_.removeClass('entryCode');
        }

        if (Entry.engine.isState('run')) {
            this.curtainView_.removeClass('entryRemove');
        }
        this.viewMode_ = viewType;
        this.selectedViewMode = viewType;
        this.toggleOffVariableView();
    }

    /**
     * render variable view
     * @return {!Element}
     */
    createVariableView() {
        const view = Entry.createElement('div');
        if (!Entry.type || Entry.type === 'workspace') {
            view.addClass('entryVariablePanelWorkspace');
        } else if (Entry.type === 'phone') {
            view.addClass('entryVariablePanelPhone');
        }
        this.variableViewWrapper_ = view;
        Entry.variableContainer.createDom(view);
        return view;
    }

    /**
     * toggle on variable view
     */
    toggleOnVariableView() {
        Entry.playground.changeViewMode('code');
        this.hideBlockMenu();
        this.variableView_.removeClass('entryRemove');
        this.resizeHandle_.removeClass('entryRemove');
        this.viewMode_ = 'variable';
        this.selectedViewMode = 'variable';
    }

    toggleOffVariableView() {
        this.showBlockMenu();
        this.variableView_.addClass('entryRemove');
    }

    /**
     * Generate category menu with object type.
     * @param {!string} objectType
     */
    setMenu(objectType) {
        if (this.currentObjectType == objectType) {
            return;
        }

        const blockMenu = this.blockMenu;
        blockMenu.unbanClass(this.currentObjectType, true);
        blockMenu.banClass(objectType, true);
        blockMenu.setMenu(true);
        this.currentObjectType = objectType;
    }

    hideTabs() {
        ['picture', 'text', 'sound', 'variable'].forEach(this.hideTab.bind(this));
    }

    hideTab(item) {
        if (this.tabViewElements[item]) {
            this.tabViewElements[item].addClass('hideTab');
            this.tabViewElements[item].removeClass('showTab');
        }
    }

    showTabs() {
        ['picture', 'text', 'sound', 'variable'].forEach(this.showTab.bind(this));
    }

    showTab(item) {
        if (this.tabViewElements[item]) {
            this.tabViewElements[item].addClass('showTab');
            this.tabViewElements[item].removeClass('hideTab');
        }
    }

    /**
     * Handle is resizing playground handle.
     * This add mouse move and mouse up event to document.
     * @param {!Element} handle
     */
    initializeResizeHandle(handle) {
        let listener;
        const that = this;
        $(handle).bind('mousedown touchstart', function(e) {
            e.preventDefault();
            that.resizing = true;
            if (Entry.documentMousemove) {
                listener = Entry.documentMousemove.attach(this, function({ clientX }) {
                    if (that.resizing) {
                        Entry.resizeElement({
                            menuWidth: clientX - Entry.interfaceState.canvasWidth,
                        });
                    }
                });
            }
            $(document).bind('mouseup.resizeHandle touchend.resizeHandle', function() {
                $(document).unbind('.resizeHandle');
                if (listener) {
                    that.resizing = false;
                    listener.destroy();
                    listener = undefined;
                }
            });
        });
    }

    /**
     * Reload playground
     */
    reloadPlayground() {
        const engine = Entry.engine;

        if (engine && engine.isState('run')) {
            return;
        }
        _.result(this.mainWorkspace, 'dReDraw');
    }

    /**
     * flush playground when object is not exist
     */
    flushPlayground() {
        this.object = null;
        if (Entry.playground && Entry.playground.view_) {
            this.injectPicture();
            this.injectSound();
            const board = Entry.playground.mainWorkspace.getBoard();
            board.clear();
            board.changeCode(null);
        }
    }

    refreshPlayground() {
        if (Entry.playground && Entry.playground.view_) {
            if (this.getViewMode() === 'picture') {
                this.injectPicture();
            }
            if (this.getViewMode() === 'sound') {
                this.injectSound();
            }
        }
    }

    generatePictureElement(picture) {
        const element = Entry.createElement('li', picture.id)
            .addClass('entryPlaygroundPictureElement')
            .bindOnClick(function() {
                Entry.playground.selectPicture(this.picture);
            });
        picture.view = element;
        element.picture = picture;

        Entry.Utils.disableContextmenu(picture.view);
        Entry.ContextMenu.onContextmenu(picture.view, function(coordinate) {
            const options = [
                {
                    text: Lang.Workspace.context_rename,
                    callback() {
                        nameView.focus();
                    },
                },
                {
                    text: Lang.Workspace.context_duplicate,
                    callback() {
                        Entry.playground.clonePicture(picture.id);
                    },
                },
                {
                    text: Lang.Workspace.context_remove,
                    callback() {
                        if (Entry.playground.object.removePicture(picture.id)) {
                            Entry.removeElement(element);
                            Entry.dispatchEvent('removePicture', picture);
                            Entry.toast.success(
                                Lang.Workspace.shape_remove_ok,
                                `${picture.name} ${Lang.Workspace.shape_remove_ok_msg}`
                            );
                        } else {
                            Entry.toast.alert(
                                Lang.Workspace.shape_remove_fail,
                                Lang.Workspace.shape_remove_fail_msg
                            );
                        }
                    },
                },
                {
                    text: Lang.Workspace.context_download,
                    callback() {
                        Entry.playground.downloadPicture(picture.id);
                    },
                },
            ];
            Entry.ContextMenu.show(options, 'workspace-contextmenu', coordinate);
        });

        element.orderHolder = Entry.createElement('div')
            .addClass('entryPlaygroundPictureOrder')
            .appendTo(element);

        const thumbnailView = Entry.createElement('div', `t_${picture.id}`).addClass(
            'entryPlaygroundPictureThumbnail'
        );

        thumbnailView.addEventListener('touchmove', (e) => {
            e.preventDefault();
        });

        if (picture.fileurl) {
            thumbnailView.style.backgroundImage = `url("${picture.fileurl}")`;
        } else {
            // deptecated
            const fileName = picture.filename;
            thumbnailView.style.backgroundImage = `url("${
                Entry.defaultPath
            }/uploads/${fileName.substring(0, 2)}/${fileName.substring(
                2,
                4
            )}/thumb/${fileName}.png")`;
        }
        element.appendChild(thumbnailView);
        const nameView = Entry.createElement('input')
            .addClass('entryPlaygroundPictureName')
            .addClass('entryEllipsis');
        nameView.picture = picture;
        nameView.value = picture.name;
        Entry.attachEventListener(nameView, 'blur', nameViewBlur);

        function nameViewBlur() {
            if (this.value.trim() === '') {
                Entry.deAttachEventListener(this, 'blur', nameViewBlur);
                entrylms.alert(Lang.Workspace.enter_the_name);
                this.focus();
                Entry.attachEventListener(this, 'blur', nameViewBlur);
                return;
            }

            let nameViewArray = $('.entryPlaygroundPictureName');
            if (nameViewArray.length !== Entry.playground.object.pictures.length) {
                nameViewArray = nameViewArray.slice(0, -1); // pop last element (드래그 시 발생하는 임시 엘리먼트임)
            }

            for (let i = 0; i < nameViewArray.length; i++) {
                if (nameViewArray.eq(i).val() == nameView.value && nameViewArray[i] != this) {
                    Entry.deAttachEventListener(this, 'blur', nameViewBlur);
                    entrylms.alert(Lang.Workspace.name_already_exists);
                    this.focus();
                    Entry.attachEventListener(this, 'blur', nameViewBlur);
                    return;
                }
            }
            const newValue = this.value;
            this.picture.name = newValue;
            const playground = Entry.playground;
            if (playground) {
                if (playground.object) {
                    const pic = playground.object.getPicture(this.picture.id);
                    if (pic) {
                        pic.name = newValue;
                    }
                }
                const painter = playground.painter;
                if (painter && painter.file) {
                    painter.file.name = newValue;
                }

                playground.reloadPlayground();
            }
            Entry.dispatchEvent('pictureNameChanged', this.picture);
        }

        nameView.onkeypress = Entry.Utils.blurWhenEnter;
        element.appendChild(nameView);
        Entry.createElement('div', `s_${picture.id}`)
            .addClass('entryPlaygroundPictureSize')
            .appendTo(element).innerHTML = `${picture.dimension.width} X ${
                picture.dimension.height
            }`;

        const removeButton = Entry.createElement('div').addClass('entryPlayground_del');
        const { Buttons = {} } = Lang || {};
        const { delete: delText = '삭제' } = Buttons;
        removeButton.appendTo(element).innerText = delText;
        removeButton.bindOnClick(() => {
            try {
                if (Entry.playground.object.removePicture(picture.id)) {
                    Entry.removeElement(element);
                    Entry.dispatchEvent('removePicture', picture);
                    Entry.toast.success(
                        Lang.Workspace.shape_remove_ok,
                        `${picture.name} ${Lang.Workspace.shape_remove_ok_msg}`
                    );
                } else {
                    Entry.toast.alert(
                        Lang.Workspace.shape_remove_fail,
                        Lang.Workspace.shape_remove_fail_msg
                    );
                }
            } catch (e) {
                Entry.toast.alert(
                    Lang.Workspace.shape_remove_fail,
                    Lang.Workspace.shape_remove_fail_msg
                );
            }
        });
    }

    generateSoundElement(sound) {
        const element = Entry.createElement('sound', sound.id).addClass(
            'entryPlaygroundSoundElement'
        );
        sound.view = element;
        element.sound = sound;

        Entry.Utils.disableContextmenu(sound.view);
        Entry.ContextMenu.onContextmenu(sound.view, function(coordinate) {
            const options = [
                {
                    text: Lang.Workspace.context_rename,
                    callback() {
                        nameView.focus();
                    },
                },
                {
                    text: Lang.Workspace.context_duplicate,
                    callback() {
                        Entry.playground.addSound(sound, true, true);
                    },
                },
                {
                    text: Lang.Workspace.context_remove,
                    callback() {
                        const result = Entry.do(
                            'objectRemoveSound',
                            Entry.playground.object.id,
                            sound
                        );
                        if (result) {
                            Entry.removeElement(element);
                            Entry.dispatchEvent('removeSound', sound);
                            Entry.toast.success(
                                Lang.Workspace.sound_remove_ok,
                                `${sound.name} ${Lang.Workspace.sound_remove_ok_msg}`
                            );
                        } else {
                            Entry.toast.alert(Lang.Workspace.sound_remove_fail, '');
                        }
                        Entry.removeElement(element);
                    },
                },
                {
                    text: Lang.Workspace.context_download,
                    callback() {
                        Entry.playground.downloadSound(sound.id);
                    },
                },
            ];
            Entry.ContextMenu.show(options, 'workspace-contextmenu', coordinate);
        });

        element.orderHolder = Entry.createElement('div')
            .addClass('entryPlaygroundSoundOrder')
            .appendTo(element);

        const thumbnailView = Entry.createElement('div')
            .addClass('entryPlaygroundSoundThumbnail entryPlaygroundSoundPlay')
            .appendTo(element);
        let isPlaying = false;
        let soundInstance;

        element.bindOnClick(() => {
            this.selectSound(sound);
        });

        thumbnailView.addEventListener('touchmove', (e) => {
            e.preventDefault();
        });

        thumbnailView.bindOnClick(() => {
            this.selectSound(sound);

            if (isPlaying) {
                isPlaying = false;
                thumbnailView.removeClass('entryPlaygroundSoundStop');
                thumbnailView.addClass('entryPlaygroundSoundPlay');
                soundInstance.stop();
                return;
            } else {
                isPlaying = true;
                thumbnailView.removeClass('entryPlaygroundSoundPlay');
                thumbnailView.addClass('entryPlaygroundSoundStop');
                soundInstance = createjs.Sound.play(sound.id);
            }

            soundInstance.addEventListener('complete', function() {
                thumbnailView.removeClass('entryPlaygroundSoundStop');
                thumbnailView.addClass('entryPlaygroundSoundPlay');
                isPlaying = false;
            });
        });

        const nameView = Entry.createElement('input')
            .addClass('entryPlaygroundSoundName')
            .appendTo(element);
        nameView.sound = sound;
        nameView.value = sound.name;
        Entry.attachEventListener(nameView, 'blur', nameViewBlur);

        function nameViewBlur() {
            if (this.value.trim() === '') {
                Entry.deAttachEventListener(this, 'blur', nameViewBlur);
                entrylms.alert(Lang.Workspace.enter_the_name);
                this.focus();
                Entry.attachEventListener(this, 'blur', nameViewBlur);
                return;
            }

            let nameViewArray = $('.entryPlaygroundSoundName');
            if (nameViewArray.length !== Entry.playground.object.sounds.length) {
                nameViewArray = nameViewArray.slice(0, -1); // pop last element (드래그 시 발생하는 임시 엘리먼트임)
            }

            for (let i = 0; i < nameViewArray.length; i++) {
                if (nameViewArray.eq(i).val() == nameView.value && nameViewArray[i] != this) {
                    Entry.deAttachEventListener(this, 'blur', nameViewBlur);
                    entrylms.alert(Lang.Workspace.name_already_exists);
                    this.focus();
                    Entry.attachEventListener(this, 'blur', nameViewBlur);
                    return;
                }
            }
            const newValue = this.value;
            this.sound.name = newValue;
            Entry.playground.reloadPlayground();
        }

        nameView.onkeypress = Entry.Utils.blurWhenEnter;
        Entry.createElement('div')
            .addClass('entryPlaygroundSoundLength')
            .appendTo(element).innerHTML = `${sound.duration} ${Lang.General.second}`;
        const removeButton = Entry.createElement('div').addClass('entryPlayground_del');
        const { Buttons = {} } = Lang || {};
        const { delete: delText = '삭제' } = Buttons;
        removeButton.appendTo(element).innerText = delText;
        removeButton.bindOnClick(() => {
            try {
                const result = Entry.do('objectRemoveSound', Entry.playground.object.id, sound);
                if (result) {
                    Entry.dispatchEvent('removeSound', sound);
                    Entry.toast.success(
                        Lang.Workspace.sound_remove_ok,
                        `${sound.name} ${Lang.Workspace.sound_remove_ok_msg}`
                    );
                } else {
                    Entry.toast.alert(Lang.Workspace.sound_remove_fail, '');
                }
                Entry.removeElement(element);
            } catch (e) {
                Entry.toast.alert(Lang.Workspace.sound_remove_fail, '');
            }
        });
    }

    openDropDown = (options, target, callback, closeCallback) => {
        const dropdownWidget = new EntryTool({
            type: 'dropdownWidget',
            data: {
                items: options,
                positionDom: target,
                onOutsideClick: () => {
                    if (dropdownWidget) {
                        closeCallback();
                        dropdownWidget.hide();
                    }
                },
            },
            container: Entry.Dom('div', {
                class: 'entry-widget-dropdown',
                parent: $('body'),
            })[0],
        }).on('select', (item) => {
            callback(item);
            closeCallback();
            dropdownWidget.hide();
        });
        return dropdownWidget;
    };

    openColourPicker = (target, color ,canTransparent , callback) => {
        const colorPicker = new EntryTool({
            type: 'colorPicker',
            data: {
                color,
                positionDom: target,
                canTransparent: canTransparent,
                onOutsideClick: (color) => {
                    if (colorPicker) {
                        colorPicker.hide();
                    }
                },
            },
            container: Entry.Dom('div', {
                class: 'entry-color-picker',
                parent: $('body'),
            })[0],
        }).on('change', (color) => {
            if (color) {
                callback(color, true);
            }
        });
        return colorPicker;
    };

    selectSound(sound) {
        this.object.sounds.forEach((item) => {
            if (item.id !== sound.id) {
                item.view.removeClass('entrySoundSelected');
            } else {
                item.view.addClass('entrySoundSelected');
            }
        })
    }

    setTextColour(colour) {
        $('.style_link.imbtn_pop_font_color').toggleClass('on', colour !== '#000000');
        this.object.entity.setColour(colour);
        this.textEditArea.style.color = colour;
        this.textEditInput.style.color = colour;
    }

    setBackgroundColour(colour) {
        $('.style_link.imbtn_pop_font_backgroundcolor').toggleClass('on', colour !== '#ffffff');
        this.object.entity.setBGColour(colour);
        this.textEditArea.style.backgroundColor = colour;
        this.textEditInput.style.backgroundColor = colour;
    }

    isTextBGMode() {
        return this.isTextBGMode_;
    }

    checkVariables() {
        if (Entry.forEBS) {
            return;
        }
        const blockMenu = this.blockMenu;
        const { lists_, variables_ } = Entry.variableContainer;

        if (lists_.length) {
            blockMenu.unbanClass('listNotExist');
        } else {
            blockMenu.banClass('listNotExist');
        }

        if (variables_.length) {
            blockMenu.unbanClass('variableNotExist');
        } else {
            blockMenu.banClass('variableNotExist');
        }
    }

    getViewMode() {
        return this.viewMode_;
    }

    banExpansionBlock() {
        const blockMenu = _.result(this.mainWorkspace, 'blockMenu');
        if (!blockMenu) {
            return;
        }

        Object.values(Entry.EXPANSION_BLOCK_LIST).forEach((block) => {
            blockMenu.banClass(block.name, true);
            blockMenu.banClass(`${block.name}_legacy`, true);
        });
    }

    updateHW() {
        const blockMenu = _.result(this.mainWorkspace, 'blockMenu');
        if (!blockMenu) {
            return;
        }

        const hw = Entry.hw;
        if (hw && hw.connected) {
            blockMenu.banClass('arduinoDisconnected', true);

            hw.banHW();

            if (hw.hwModule) {
                blockMenu.banClass('arduinoConnect', true);
                blockMenu.unbanClass('arduinoConnected', true);
                blockMenu.unbanClass(hw.hwModule.name);
            } else {
                blockMenu.banClass('arduinoConnected', true);
                blockMenu.unbanClass('arduinoConnect', true);
            }
        } else {
            blockMenu.banClass('arduinoConnected', true);
            blockMenu.banClass('arduinoConnect', true);
            blockMenu.unbanClass('arduinoDisconnected', true);

            Entry.hw.banHW();
        }

        blockMenu.hwCodeOutdated = true;
        blockMenu._generateHwCode(true);
        blockMenu.reDraw();
    }

    toggleLineBreak(isLineBreak) {
        const { objectType, entity } = this.object || {};
        if (objectType !== 'textBox') {
            return;
        }

        $('.write_type_box a').removeClass('on');
        if (isLineBreak) {
            entity.setLineBreak(true);
            $('.input_inner').height('228px');
            $('.write_type_box a')
                .eq(1)
                .addClass('on');
            $('.input_box .single').hide();
            $('.input_box .multi').show();
            this._setFontFontUI();
        } else {
            entity.setLineBreak(false);
            $('.input_inner').height('40px');
            $('.write_type_box a')
                .eq(0)
                .addClass('on');
            $('.input_box .multi').hide();
            $('.input_box .single').show();
        }
    }

    setFontAlign(fontAlign) {
        if (this.object.objectType !== 'textBox') {
            return;
        }
        this.alignLeftBtn.removeClass('on');
        this.alignCenterBtn.removeClass('on');
        this.alignRightBtn.removeClass('on');
        switch (fontAlign) {
            case Entry.TEXT_ALIGN_LEFT:
                this.alignLeftBtn.addClass('on');
                break;
            case Entry.TEXT_ALIGN_CENTER:
                this.alignCenterBtn.addClass('on');
                break;
            case Entry.TEXT_ALIGN_RIGHT:
                this.alignRightBtn.addClass('on');
                break;
        }
        this.object.entity.setTextAlign(fontAlign);
    }

    hideBlockMenu() {
        this.mainWorkspace.getBlockMenu().hide();
    }

    showBlockMenu() {
        this.mainWorkspace.getBlockMenu().show();
    }

    getDom(query) {
        if (query.length) {
            switch (query.shift()) {
                case 'tabViewElements':
                    return this.tabViewElements[query.shift()];
                case 'blockMenu':
                    return this.blockMenu.getDom(query);
                case 'board':
                case 'overlayBoard':
                    return this.mainWorkspace.getCurrentBoard().getDom(query);
                case 'pictureAddButton':
                    return this._pictureAddButton;
                case 'soundAddButton':
                    return this._soundAddButton;
            }
        } else {
        }
    }

    applyTabOption() {
        this.textboxTab.addClass('entryRemove');
        this.pictureTab.addClass('entryRemove');
        this.soundTab.addClass('entryRemove');
        this.variableTab.addClass('entryRemove');
        if (Entry.pictureEditable) {
            this.pictureTab.removeClass('entryRemove');
            this.textboxTab.removeClass('entryRemove');
        }
        if (Entry.soundEditable) {
            this.soundTab.removeClass('entryRemove');
        }
        if (Entry.hasVariableManager) {
            this.variableTab.removeClass('entryRemove');
        }
    }
};