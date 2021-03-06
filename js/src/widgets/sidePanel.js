(function($) {

    $.SidePanel= function(options) {
        jQuery.extend(true, this, {
            element:           null,
            appendTo:          null,
            parent:            null,
            manifest:          null,
            panelState:        {},
            tocTabAvailable:   false,
            annotationsTabAvailable: false,
            layersTabAvailable: false,
            toolsTabAvailable: false,
            hasStructures:     false
        }, options);

        this.init();
    };

    $.SidePanel.prototype = {
        init: function() {
            var _this = this;
            this.windowId = this.parent.id;

            this.state({
                tabs : [
                {
                    name : 'toc',
                    options : {
                        available: _this.tocTabAvailable,
                        id:'tocTab', 
                        label:'Index'
                    }
                },
                /*{
                    name : 'annotations',
                    options : {
                        available: _this.annotationsTabAvailable,
                        id:'annotationsTab', 
                        label:'Annotations'
                    }
                },*/
                /*{
                    name : 'layers',
                    options : {
                        available: _this.layersTabAvailable,
                        id:'layersTab', 
                        label:'Layers'
                    }
                },
                {
                    name : 'tools',
                    options : {
                        available: _this.toolsTabAvailable,
                        id:'toolsTab', 
                        label:'Tools'
                    }
                }*/
                ],
                width: 280,
                open: true
            }, true);

            this.listenForActions();
            this.render(this.state());

            this.loadSidePanelComponents();
        },  

        loadSidePanelComponents: function() {
            var _this = this;

            new $.Tabs({
                windowId: this.parent.id,
                appendTo: this.appendTo,
                tabs : this.panelState.tabs,
                parent : this
            });

            if (this.tocTabAvailable) {
                new $.TableOfContents({
                    manifest: this.manifest,
                    appendTo: this.element.find('.tabContentArea'),
                    parent: this.parent,
                    panel: true,
                    canvasID: this.parent.currentCanvasID
                });
            }
            if (_this.annotationsTabAvailable) {
                new $.AnnotationsTab({
                    manifest: _this.manifest,
                    parent: this.parent,
                    appendTo: _this.element.find('.tabContentArea'),
                    tabs: _this.state.tabs
                });
            }

        },

        update: function(name, availability) {
            var state = this.panelState;
            jQuery.each(state.tabs, function(index, value) {
                if (value.name === name) {
                    value.options.available = availability;
                }
            });
            this.state(state);
        },

        state: function(state, initial) {
            if (!arguments.length) return this.panelState;
            jQuery.extend(true, this.panelState, state);

            if (!initial) {
                jQuery.publish('sidePanelStateUpdated.' + this.windowId, this.panelState);
            }

            /*var enableSidePanel = false;
            jQuery.each(this.panelState.tabs, function(index, value) {
                if (value.options.available) {
                    enableSidePanel = true;
                }
            });

            this.toggle(enableSidePanel);*/

            return this.panelState;
        },

        panelToggled: function() {
            var state = this.state(),
                open = !state.open;

            state.open = open;
            this.state(state);
        },

        // doesn't do anything right now
        // getTemplateData: function() {
        //     return {
        //         annotationsTab: this.state().annotationsTab,
        //         tocTab: this.state().tocTab
        //     };
        // },

        listenForActions: function() {
            var _this = this;
            jQuery.subscribe('sidePanelStateUpdated.' + this.windowId, function(_, data) {
                _this.render(data);
            });

            jQuery.subscribe('sidePanelResized', function() {
            });

            jQuery.subscribe('sidePanelToggled.' + this.windowId, function() {
                _this.panelToggled();
            });

            jQuery.subscribe('annotationListLoaded.' + _this.windowId, function(event) {
                if (_this.parent.annotationsAvailable[_this.parent.currentFocus]) {
                    if (_this.parent.annotationsList.length > 0) {
                        _this.update('annotations', true);
                    }
                }
            });

        },

        render: function(renderingData) {
            var _this = this;

            if (!this.element) {
                this.element = this.appendTo;
                jQuery(_this.template(renderingData)).appendTo(_this.appendTo);
                return;
            }

            if (renderingData.open) {
                this.appendTo.removeClass('minimized');
            } else {
                this.appendTo.addClass('minimized');
            }
        },

        template: Handlebars.compile([
            '<div class="tabContentArea">',
            '<ul class="tabGroup">',
            '</ul>',
            '</div>'
        ].join('')),

        toggle: function (enableSidePanel) {
            if (!enableSidePanel) {
                jQuery(this.appendTo).hide();
                this.parent.element.find('.view-container').addClass('focus-max-width');
                this.parent.element.find('.mirador-icon-toc').hide();
            } else {
                jQuery(this.appendTo).show({effect: "fade", duration: 300, easing: "easeInCubic"});
                this.parent.element.find('.view-container').removeClass('focus-max-width');
                this.parent.element.find('.mirador-icon-toc').show();                
            }
        }
    };

}(Mirador));
