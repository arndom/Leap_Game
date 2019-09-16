

class Button {
    constructor(text, type) {
        // Create a new rectangle
        let color = Koji.config.colors.buttonColor;
        let y = window.innerHeight * 0.1;
        if (type == 1) {

        }

        this.rectangle = ui.createRectangle(color, 0, y, 300, 100);
        this.rectangle.pivot.x = 0.5;
        this.rectangle.pivot.y = 0.5;


        this.rectangle.anchor.x = ThreeUI.anchors.center;
        this.rectangle.anchor.y = ThreeUI.anchors.center;

        if (type == 1) {
            this.rectangle.anchor.y = ThreeUI.anchors.bottom;
        }

        // Create text (text, font, color)
        let textSize = 32;
        this.text = ui.createText(text, textSize, font, Koji.config.colors.buttonTextColor);
        this.text.y += textSize * 0.3;

        this.text.textAlign = 'center';
        this.text.textVerticalAlign = 'center';
        this.text.anchor.x = ThreeUI.anchors.center;
        this.text.anchor.y = ThreeUI.anchors.center;
        this.text.parent = this.rectangle;
        

        let rectSize = textSize * this.text.text.length * 0.9;

        while (rectSize > window.innerWidth * 0.9) {
            rectSize = window.innerWidth * 0.9;
        }
        this.rectangle.width = rectSize;


    }

    update() {
        let bounds = this.rectangle.getBounds();

        let coords = ui.windowToUISpace(mouseX, mouseY);

        //Mouse over effect
        if (ThreeUI.isInBoundingBox(coords.x, coords.y, bounds.x, bounds.y, bounds.width, bounds.height)) {
            // Put listeners in a queue first, so state changes do not impact checking other click handlers
            this.rectangle.alpha = Smooth(this.rectangle.alpha, 0.6, 4);
        } else {
            this.rectangle.alpha = Smooth(this.rectangle.alpha, 1, 4);
        }

    }
}


class SoundButton {
    constructor() {
        // Create a new Sprite

        let size = 32;

        this.sprite = Koji.config.soundOn;

        this.img = ui.createSprite(Koji.config.images.soundOff);
        this.img.x = 32;
        this.img.y = 32;
        this.img.pivot.x = 0.5;
        this.img.pivot.y = 0.5;

        this.img.width = size;
        this.img.height = size;

        this.img.anchor.x = ThreeUI.anchors.right;
        this.img.anchor.y = ThreeUI.anchors.bottom;

        let color = Koji.config.colors.buttonColor;
        this.rectangle = ui.createRectangle(color, this.img.x, this.img.y, this.img.width, this.img.height);
        this.rectangle.pivot.x = 0.5;
        this.rectangle.pivot.y = 0.5;

        this.rectangle.alpha = 0;


        this.rectangle.anchor.x = ThreeUI.anchors.right;
        this.rectangle.anchor.y = ThreeUI.anchors.bottom;

        this.updateImage();
    }

    update() {





    }

    updateImage() {
        if (soundEnabled) {
            this.sprite = Koji.config.images.soundOn;
        } else {
            this.sprite = Koji.config.images.soundOff;
        }
        this.img.setAssetPath(this.sprite);
    }
}