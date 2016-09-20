angular.module("app.core").run(["$templateCache", function($templateCache) {$templateCache.put("app/core/404.html","<section id=dashboard-view class=mainbar><section class=matter><div class=container><div class=row><div class=col-md-12><ul class=today-datas><li class=bred><div class=pull-left><i class=\"fa fa-warning\"></i></div><div class=\"datas-text pull-right\"><a><span class=bold>404</span></a>Page Not Found</div><div class=clearfix></div></li></ul></div></div></div></section></section>");
$templateCache.put("app/game/game.html","<md-content flex layout=column><div flex layout=row layout-align=\"center center\"><div flex=66><md-grid-list md-cols={{vm.numOfCols}} md-gutter=1em md-row-height=1:1><md-grid-tile md-colspan=1 ng-repeat=\"image in vm.images track by $index\" class=flip-container ng-click=\"vm.imageFlipped(image, $index)\" ng-class=\"{\'flipped\': image.flipped}\" ondragstart=\"return false;\" ondrop=\"return false;\" unselectable=on><div class=flipper flex layout-fill><div class=front flex layout-fill><img ng-attr-src={{image.url}}></div><div class=back flex layout-fill><span>S</span></div></div></md-grid-tile></md-grid-list></div></div></md-content>");
$templateCache.put("app/profile/profile.html","<md-content flex layout=column><div flex layout=row layout-align=\"center center\"><md-card flex=25><md-card-title><md-card-title-text><span class=md-headline>Profile</span></md-card-title-text><md-card-title-media><img ng-attr-src={{vm.user.picture}} class=md-card-image alt=\"Profile picture\"></md-card-title-media></md-card-title><md-card-content><label>Display Name</label> {{vm.user.displayName}}</md-card-content></md-card></div><div flex layout=row layout-align=\"center center\"><md-button flex=10 class=\"md-raised md-primary\" ng-click=vm.getImages()>Get Images</md-button></div><div flex layout=row layout-align=\"center center\"><div flex=50><md-grid-list md-cols=5 md-gutter=1em md-row-height=1:1><md-grid-tile md-colspan=1 ng-repeat=\"image in vm.images\"><img ng-attr-src={{image}} style=\"height: 100%;\"><md-grid-tile-footer layout=row layout-align=\"end center\" ng-if=vm.imagesRefreshed><label>Save?&nbsp;&nbsp;<md-checkbox checklist-model=vm.user.images checklist-value=image checklist-change=vm.updateImages() aria-label=\"Save Image?\"></md-checkbox></label></md-grid-tile-footer></md-grid-tile></md-grid-list></div></div></md-content>");
$templateCache.put("app/root/home.html","<md-content><h1>Memory the Matching Game</h1></md-content>");
$templateCache.put("app/root/root.html","<md-content flex layout-fill><md-nav-bar md-selected-nav-item=rootVm.currentNavItem nav-bar-aria-label=\"navigation links\"><md-nav-item md-nav-sref=home name=home>Home</md-nav-item><md-nav-item md-nav-sref=game name=game ng-if=rootVm.isAuthenticated()>New Game</md-nav-item><md-nav-item flex></md-nav-item><md-nav-item md-nav-click=\"rootVm.authenticate(\'instagram\')\" name=login ng-if=!rootVm.isAuthenticated()>Login</md-nav-item><md-nav-item md-nav-sref=profile name=profile ng-if=rootVm.isAuthenticated()>Profile</md-nav-item><md-nav-item md-nav-click=rootVm.logout() name=logout ng-if=rootVm.isAuthenticated()>Logout</md-nav-item></md-nav-bar><ui-view class=md-padding></ui-view></md-content>");}]);