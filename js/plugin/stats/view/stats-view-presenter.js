define(function(require) {

    var BaseSectionViewPresenter = require('aw-bubble/presenter/base-section-view-presenter'),
        // DEBT: decouple modules (+++)
        EditorController = require('plugin/editor/controller/editor-controller'),
        queries = require('plugin/stats/model/queries');

    var StatsViewPresenter = BaseSectionViewPresenter.extend({

        pub: {
            inject: 'pub'
        },
        
        settings: {
            inject: 'settings'
        },
        
        scriptModel: {
            inject: 'script'
        },
        
        editorController: {
            inject: EditorController
        },

        init: function() {
            BaseSectionViewPresenter.init.call(this);
            this.view.on('goto', this._goto);
        },

        activate: function() {
            BaseSectionViewPresenter.activate.call(this);

            var statsData = {};
            // editor.synced.add(plugin.refresh);
            statsData.days_and_nights = queries.days_and_nights.run(this.scriptModel.parsed_stats.tokens, this.settings.stats_keep_last_scene_time);
            statsData.int_and_ext = queries.int_and_ext.run(this.scriptModel.parsed_stats.tokens);
            statsData.scenes = queries.scene_length.run(this.scriptModel.parsed_stats.tokens, this.settings.stats_keep_last_scene_time);
            var basics = this.scriptModel.getBasicStats();
            statsData.who_with_who = queries.dialogue_breakdown.run(this.scriptModel.parsed_stats.tokens, basics, this.settings.stats_who_with_who_max);
            statsData.page_balance = queries.page_balance.run(this.scriptModel.parsed_stats.lines);
            statsData.tempo = queries.tempo.run(this.scriptModel.parsed_stats.tokens);
            statsData.locationsBreakdown = queries.locationsBreakdown.run(this.scriptModel.parsed_stats.tokens, this.settings.print().lines_per_page);

            this.view.data = statsData;
        },

        deactivate: function() {
            BaseSectionViewPresenter.deactivate.call(this);
            //editor.synced.remove(plugin.refresh);
        },

        _goto: function(line) {
            this.editorController.goto(line);
            this.pub('stats/scene-length/go-to-editor');
        }

    });

    return StatsViewPresenter;
});