"use strict";
function __export(m) {
    for (var p in m) if (!exports.hasOwnProperty(p)) exports[p] = m[p];
}
Object.defineProperty(exports, "__esModule", { value: true });
__export(require("./image-common"));
var image_common_1 = require("./image-common");
var utils = require("tns-core-modules/utils/utils");
var types = require("tns-core-modules/utils/types");
var imageSource = require("tns-core-modules/image-source");
var fs = require("tns-core-modules/file-system");
var view_1 = require("tns-core-modules/ui/core/view");
var platform_1 = require("tns-core-modules/platform/platform");
var SDImageRoundAsCircleTransformer = (function (_super) {
    __extends(SDImageRoundAsCircleTransformer, _super);
    function SDImageRoundAsCircleTransformer() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    SDImageRoundAsCircleTransformer.transformer = function () {
        var transformer = SDImageRoundAsCircleTransformer.alloc().init();
        return transformer;
    };
    Object.defineProperty(SDImageRoundAsCircleTransformer.prototype, "transformerKey", {
        get: function () {
            return 'SDImageRoundAsCircleTransformer';
        },
        enumerable: true,
        configurable: true
    });
    SDImageRoundAsCircleTransformer.prototype.transformedImageWithImageForKey = function (image, key) {
        if (!image) {
            return null;
        }
        var width = image.size.width;
        var height = image.size.height;
        var minwidth = Math.min(width, height);
        var cornerRadius = minwidth / 2;
        var result = image
            .sd_resizedImageWithSizeScaleMode(CGSizeMake(minwidth, minwidth), 2)
            .sd_roundedCornerImageWithRadiusCornersBorderWidthBorderColor(cornerRadius, 4 | 8 | 1 | 2, 0, null)
            .sd_resizedImageWithSizeScaleMode(CGSizeMake(width, height), 1);
        return result;
    };
    SDImageRoundAsCircleTransformer.ObjCProtocols = [SDImageTransformer];
    return SDImageRoundAsCircleTransformer;
}(NSObject));
var SDDecodeSizeTransformer = (function (_super) {
    __extends(SDDecodeSizeTransformer, _super);
    function SDDecodeSizeTransformer() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    SDDecodeSizeTransformer.transformerWithDecodeWidthDecodeHeight = function (decodeWidth, decodeHeight) {
        var transformer = SDDecodeSizeTransformer.new();
        transformer.decodeWidth = decodeWidth;
        transformer.decodeHeight = decodeHeight;
        return transformer;
    };
    Object.defineProperty(SDDecodeSizeTransformer.prototype, "transformerKey", {
        get: function () {
            return "SDDecodeSizeTransformer " + this.decodeWidth + " " + this.decodeHeight;
        },
        enumerable: true,
        configurable: true
    });
    SDDecodeSizeTransformer.prototype.transformedImageWithImageForKey = function (image, key) {
        if (!image) {
            return null;
        }
        var ratio = 1;
        var width = image.size.width;
        var height = image.size.height;
        if (this.decodeWidth && this.decodeHeight) {
            var widthRatio = this.decodeWidth / width;
            var heightRatio = this.decodeHeight / height;
            ratio = Math.max(widthRatio, heightRatio);
        }
        else if (this.decodeWidth > 0) {
            ratio = this.decodeWidth / width;
        }
        else {
            ratio = this.decodeHeight / height;
        }
        var minwidth = Math.min(width, height);
        return image.sd_resizedImageWithSizeScaleMode(CGSizeMake(width * ratio, height * ratio), 2);
    };
    SDDecodeSizeTransformer.ObjCProtocols = [SDImageTransformer];
    return SDDecodeSizeTransformer;
}(NSObject));
var ImageInfo = (function () {
    function ImageInfo(width, height) {
        this.width = width;
        this.height = height;
    }
    ImageInfo.prototype.getHeight = function () {
        return this.height;
    };
    ImageInfo.prototype.getWidth = function () {
        return this.width;
    };
    return ImageInfo;
}());
exports.ImageInfo = ImageInfo;
var supportedLocalFormats = ['png', 'jpg', 'gif', 'jpeg', 'webp'];
var screenScale = -1;
function getScaleType(scaleType) {
    if (types.isString(scaleType)) {
        switch (scaleType) {
            case image_common_1.ScaleType.Center:
            case image_common_1.ScaleType.CenterCrop:
            case image_common_1.ScaleType.AspectFill:
                return 2;
            case image_common_1.ScaleType.CenterInside:
            case image_common_1.ScaleType.FitCenter:
            case image_common_1.ScaleType.FitEnd:
            case image_common_1.ScaleType.FitStart:
            case image_common_1.ScaleType.AspectFit:
                return 1;
            case image_common_1.ScaleType.FitXY:
            case image_common_1.ScaleType.FocusCrop:
            case image_common_1.ScaleType.Fill:
                return 0;
            default:
                break;
        }
    }
    return null;
}
function getUIImageScaleType(scaleType) {
    if (types.isString(scaleType)) {
        switch (scaleType) {
            case image_common_1.ScaleType.Center:
                return 4;
            case image_common_1.ScaleType.FocusCrop:
            case image_common_1.ScaleType.CenterCrop:
            case image_common_1.ScaleType.AspectFill:
                return 2;
            case image_common_1.ScaleType.AspectFit:
            case image_common_1.ScaleType.CenterInside:
            case image_common_1.ScaleType.FitCenter:
                return 1;
            case image_common_1.ScaleType.FitEnd:
                return 8;
            case image_common_1.ScaleType.FitStart:
                return 7;
            case image_common_1.ScaleType.Fill:
            case image_common_1.ScaleType.FitXY:
                return 0;
            case image_common_1.ScaleType.None:
                return 9;
            default:
                break;
        }
    }
    return null;
}
function initialize(config) { }
exports.initialize = initialize;
function shutDown() { }
exports.shutDown = shutDown;
var ImagePipeline = (function () {
    function ImagePipeline() {
        this._ios = SDImageCache.sharedImageCache;
    }
    ImagePipeline.prototype.isInDiskCacheSync = function (uri) {
        return this._ios.diskImageDataExistsWithKey(uri);
    };
    ImagePipeline.prototype.isInBitmapMemoryCache = function (uri) {
        return this._ios.imageFromMemoryCacheForKey(uri) !== null;
    };
    ImagePipeline.prototype.evictFromMemoryCache = function (uri) {
        this._ios.removeImageFromMemoryForKey(uri);
    };
    ImagePipeline.prototype.evictFromDiskCache = function (uri) {
        this._ios.removeImageFromDiskForKey(uri);
    };
    ImagePipeline.prototype.evictFromCache = function (uri) {
        this._ios.removeImageForKeyWithCompletion(uri, null);
    };
    ImagePipeline.prototype.clearCaches = function () {
        this._ios.clearMemory();
        this._ios.clearDiskOnCompletion(null);
    };
    ImagePipeline.prototype.clearMemoryCaches = function () {
        this._ios.clearMemory();
    };
    ImagePipeline.prototype.clearDiskCaches = function () {
        this._ios.clearDiskOnCompletion(null);
    };
    Object.defineProperty(ImagePipeline.prototype, "ios", {
        get: function () {
            return this._ios;
        },
        enumerable: true,
        configurable: true
    });
    return ImagePipeline;
}());
exports.ImagePipeline = ImagePipeline;
function getImagePipeline() {
    var imagePineLine = new ImagePipeline();
    return imagePineLine;
}
exports.getImagePipeline = getImagePipeline;
function getUri(src) {
    var uri = src;
    if (src.indexOf(utils.RESOURCE_PREFIX) === 0) {
        var resName_1 = src.substr(utils.RESOURCE_PREFIX.length);
        if (screenScale === -1) {
            screenScale = platform_1.screen.mainScreen.scale;
        }
        supportedLocalFormats.some(function (v) {
            for (var i = screenScale; i >= 1; i--) {
                uri = NSBundle.mainBundle.URLForResourceWithExtension(i > 1 ? resName_1 + "@" + i + "x" : resName_1, v);
                if (!!uri) {
                    return true;
                }
            }
            return false;
        });
    }
    else if (src.indexOf('~/') === 0) {
        uri = NSURL.alloc().initFileURLWithPath("" + fs.path.join(fs.knownFolders.currentApp().path, src.replace('~/', '')));
    }
    return uri;
}
var Img = (function (_super) {
    __extends(Img, _super);
    function Img() {
        var _this = _super !== null && _super.apply(this, arguments) || this;
        _this.isLoading = false;
        _this._imageSourceAffectsLayout = true;
        _this.handleImageLoaded = function (image, error, cacheType) {
            if (error) {
                var args = {
                    eventName: Img.failureEvent,
                    object: _this,
                    error: error
                };
                _this.notify(args);
                if (_this.failureImageUri) {
                    image = _this.getUIImage(_this.failureImageUri);
                }
            }
            else {
                var args = {
                    eventName: image_common_1.ImageBase.finalImageSetEvent,
                    object: _this,
                    imageInfo: new ImageInfo(image.size.width, image.size.height),
                    ios: image
                };
                _this.notify(args);
            }
            _this.handleImageProgress(1);
            _this.isLoading = false;
            if ((_this.alwaysFade || cacheType !== 2) && _this.fadeDuration > 0) {
                _this.nativeViewProtected.alpha = 0.0;
                _this._setNativeImage(image);
                UIView.animateWithDurationAnimations(_this.fadeDuration / 1000, function () {
                    _this.nativeViewProtected.alpha = _this.opacity;
                });
            }
            else {
                _this._setNativeImage(image);
            }
            if (!_this.autoPlayAnimations) {
                _this.nativeViewProtected.stopAnimating();
            }
        };
        _this.onLoadProgress = function (currentSize, totalSize) {
            _this.handleImageProgress(totalSize > 0 ? currentSize / totalSize : -1, totalSize);
        };
        return _this;
    }
    Img.prototype.createNativeView = function () {
        var result = SDAnimatedImageView.new();
        result.contentMode = 1;
        result.clipsToBounds = true;
        result.userInteractionEnabled = true;
        result.tintColor = null;
        return result;
    };
    Img.prototype._setNativeClipToBounds = function () {
        this.nativeViewProtected.clipsToBounds = true;
    };
    Img.prototype.onMeasure = function (widthMeasureSpec, heightMeasureSpec) {
        var width = view_1.layout.getMeasureSpecSize(widthMeasureSpec);
        var widthMode = view_1.layout.getMeasureSpecMode(widthMeasureSpec);
        var height = view_1.layout.getMeasureSpecSize(heightMeasureSpec);
        var heightMode = view_1.layout.getMeasureSpecMode(heightMeasureSpec);
        var image = this.nativeViewProtected.image;
        var nativeWidth = image ? view_1.layout.toDevicePixels(image.size.width) : 0;
        var nativeHeight = image ? view_1.layout.toDevicePixels(image.size.height) : 0;
        var measureWidth = Math.max(nativeWidth, this.effectiveMinWidth);
        var measureHeight = Math.max(nativeHeight, this.effectiveMinHeight);
        var finiteWidth = widthMode !== view_1.layout.UNSPECIFIED;
        var finiteHeight = heightMode !== view_1.layout.UNSPECIFIED;
        this._imageSourceAffectsLayout = widthMode !== view_1.layout.EXACTLY || heightMode !== view_1.layout.EXACTLY;
        if (image || this.aspectRatio > 0) {
            var scale = this.computeScaleFactor(width, height, finiteWidth, finiteHeight, nativeWidth, nativeHeight);
            measureWidth = finiteWidth ? width : height;
            measureHeight = finiteHeight ? height : width;
            measureWidth = Math.round(measureWidth * scale.width);
            measureHeight = Math.round(measureHeight * scale.height);
        }
        var widthAndState = Img.resolveSizeAndState(measureWidth, width, widthMode, 0);
        var heightAndState = Img.resolveSizeAndState(measureHeight, height, heightMode, 0);
        this.setMeasuredDimension(widthAndState, heightAndState);
    };
    Img.needsSizeAdjustment = function (scaleType) {
        if (scaleType === undefined) {
            return true;
        }
        switch (scaleType) {
            case image_common_1.ScaleType.FocusCrop:
            case image_common_1.ScaleType.Center:
            case image_common_1.ScaleType.CenterCrop:
            case image_common_1.ScaleType.CenterInside:
            case image_common_1.ScaleType.FitCenter:
            case image_common_1.ScaleType.AspectFit:
            case image_common_1.ScaleType.FitXY:
                return true;
            default:
                return false;
        }
    };
    Img.prototype.computeScaleFactor = function (measureWidth, measureHeight, widthIsFinite, heightIsFinite, nativeWidth, nativeHeight) {
        var scaleW = 1;
        var scaleH = 1;
        if (Img.needsSizeAdjustment(this.stretch) && (widthIsFinite || heightIsFinite)) {
            var nativeScale = nativeWidth > 0 && nativeHeight > 0 ? nativeWidth / nativeHeight : 1;
            var measureScale = measureWidth > 0 && measureHeight > 0 ? measureWidth / measureHeight : 1;
            scaleW = nativeWidth > 0 ? measureWidth / nativeWidth : 1;
            scaleH = nativeHeight > 0 ? measureHeight / nativeHeight : 1;
            if (this.aspectRatio > 0) {
                if (!widthIsFinite) {
                    scaleH = 1;
                    scaleW = this.aspectRatio;
                }
                else if (!heightIsFinite) {
                    scaleW = 1;
                    scaleH = this.aspectRatio;
                }
            }
            else {
                if (!widthIsFinite) {
                    scaleH = 1;
                    scaleW = nativeScale * scaleH;
                }
                else if (!heightIsFinite) {
                    scaleW = 1;
                    scaleH = measureScale / nativeScale;
                }
                else {
                    switch (this.stretch) {
                        case image_common_1.ScaleType.FitXY:
                        case image_common_1.ScaleType.FocusCrop:
                        case image_common_1.ScaleType.Fill:
                            break;
                        default:
                            if (measureScale > nativeScale) {
                                scaleH = 1;
                                scaleW = nativeScale * scaleH;
                            }
                            else {
                                scaleW = 1;
                                scaleH = measureScale / nativeScale;
                            }
                    }
                }
            }
        }
        return { width: scaleW, height: scaleH };
    };
    Img.prototype._setNativeImage = function (nativeImage) {
        this.nativeViewProtected.image = nativeImage;
        if (this._imageSourceAffectsLayout) {
            this._imageSourceAffectsLayout = false;
            this.requestLayout();
        }
    };
    Img.prototype.getUIImage = function (path) {
        if (!path) {
            return null;
        }
        var image;
        if (utils.isFileOrResourcePath(path)) {
            image = imageSource.fromFileOrResource(path);
        }
        if (image) {
            image = image.ios;
        }
        return image;
    };
    Img.prototype.initImage = function () {
        if (this.nativeViewProtected) {
            if (this.src) {
                this.isLoading = true;
                var options = 2048 | 1024;
                if (this.alwaysFade === true) {
                    options |= 131072;
                }
                var context = NSMutableDictionary.dictionary();
                var transformers = [];
                if (!!this.progressiveRenderingEnabled) {
                    options = options | 4;
                }
                if (this.decodeWidth && this.decodeHeight) {
                    transformers.push(SDDecodeSizeTransformer.transformerWithDecodeWidthDecodeHeight(this.decodeWidth, this.decodeHeight));
                }
                if (this.tintColor) {
                    transformers.push(SDImageTintTransformer.transformerWithColor(this.tintColor.ios));
                }
                if (this.blurRadius) {
                    transformers.push(SDImageBlurTransformer.transformerWithRadius(this.blurRadius));
                }
                if (this.roundAsCircle) {
                    transformers.push(SDImageRoundAsCircleTransformer.new());
                    transformers.push(SDImageFlippingTransformer.transformerWithHorizontalVertical(false, true));
                }
                if (this.roundBottomLeft || this.roundBottomRight || this.roundTopLeft || this.roundTopRight) {
                    var corners = 0;
                    if (this.roundTopLeft) {
                        corners = corners | 4;
                    }
                    if (this.roundTopRight) {
                        corners = corners | 8;
                    }
                    if (this.roundBottomRight) {
                        corners = corners | 2;
                    }
                    if (this.roundBottomLeft) {
                        corners = corners | 1;
                    }
                    transformers.push(SDImageRoundCornerTransformer.transformerWithRadiusCornersBorderWidthBorderColor(this.roundedCornerRadius, corners, 0, null));
                    transformers.push(SDImageFlippingTransformer.transformerWithHorizontalVertical(false, true));
                }
                if (transformers.length > 0) {
                    context.setValueForKey(SDImagePipelineTransformer.transformerWithTransformers(transformers), SDWebImageContextImageTransformer);
                }
                this.nativeViewProtected.sd_setImageWithURLPlaceholderImageOptionsContextProgressCompleted(getUri(this.src), this.getUIImage(this.placeholderImageUri), options, context, this.onLoadProgress, this.handleImageLoaded);
            }
        }
    };
    Img.prototype[image_common_1.ImageBase.srcProperty.setNative] = function () {
        this.initImage();
    };
    Img.prototype[image_common_1.ImageBase.placeholderImageUriProperty.setNative] = function () {
        this.initImage();
    };
    Img.prototype[image_common_1.ImageBase.failureImageUriProperty.setNative] = function () {
    };
    Img.prototype[image_common_1.ImageBase.stretchProperty.setNative] = function (value) {
        if (!this.nativeView) {
            return;
        }
        this.nativeViewProtected.contentMode = getUIImageScaleType(value);
    };
    Img.prototype.startAnimating = function () {
        this.nativeViewProtected.startAnimating();
    };
    Img.prototype.stopAnimating = function () {
        this.nativeViewProtected.stopAnimating();
    };
    return Img;
}(image_common_1.ImageBase));
exports.Img = Img;
//# sourceMappingURL=image.ios.js.map