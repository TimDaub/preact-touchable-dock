import { h, Component } from "preact";
import htm from "htm";
import jss from "jss";
import preset from "jss-preset-default";

const html = htm.bind(h);
jss.setup({ ...preset(), ...{ createGenerateId: () => ({ key }) => key } });

const transitionSpeed = ".1s";

const styles = {
  touchableDock: `
    width: 100%;
    position: fixed;
    bottom: 0;
    left: 0;
    z-index:9999;
  `,

  touchableDockHandle: {
    display: "flex",
    justifyContent: "center",
    cursor: "pointer",
    height: "50px",
    "&::before": `
      content: "";
      height: 10px;
      width: 50px;
      background-color: grey;
      margin-top: 20px;
    `
  },
  closeAction: `
    font-family: Arial, sans-serif;
    font-size: 2.5em;
    font-weight: 300;

    position: absolute;
    top: 0;
    left: 0;
    margin: 5px 0 0 15px;
    color: #424242;
    line-height: 1;
  `
};

const { classes } = jss.createStyleSheet(styles).attach();

class TouchableDock extends Component {
  // TODO:
  // - Add a close button to the left
  // - When clicked on any content, expand to full
  constructor(props) {
    super(props);

    this.state = {
      height: 0,
      mouseDown: false,
      touch: false,
      stage: "hide"
    };

    this.handleMovement = this.handleMovement.bind(this);
    this.setStage = this.setStage.bind(this);
  }
  componentDidMount() {
    // NOTE: If we had added the event listeners only to the handle component,
    // they wouldn't trigger on any other component outside the handle. However,
    // we want them to trigger on the whole document.
    document.addEventListener("mouseup", () =>
      this.setState({ mouseDown: false })
    );
    document.addEventListener("touchend", () =>
      this.setState({ touch: false })
    );
    document.addEventListener("mousemove", this.handleMovement);
    document.addEventListener("touchmove", this.handleMovement, {
      passive: false
    });
  }

  setStage(stage) {
    const { onClose } = this.props;
    if (stage === "hide" && onClose && typeof onClose === "function") {
      onClose();
    }
    this.setState({ height: 0, stage });
  }

  componentDidUpdate(prevProps, prevState) {
    const { height, mouseDown, stage, touch } = this.state;
    const newHeight = parseFloat(height);
    if (!mouseDown && !touch) {
      if (newHeight > 35 && newHeight !== 100) {
        this.setStage("full");
      }

      if (newHeight > 0 && stage === "full" && newHeight !== 0) {
        this.setStage("hide");
      }

      if (newHeight < 35 && newHeight !== 0) {
        this.setStage("hide");
      }
    }
  }
  screenHeight() {
    return Math.max(
      document.documentElement.clientHeight || 0,
      window.innerHeight || 0
    );
  }
  calcHeight(y, screenHeight) {
    const height = ((screenHeight - y) / screenHeight) * 100;
    this.setState({
      height: height + "%"
    });
  }
  handleMovement(evt) {
    const { touch, mouseDown } = this.state;

    // NOTE: We depend on `clientY` here, as it gives us the user's cursor
    //  position relative to the viewport. It allows the user to adjust the 
    //  dock's position even when having scrolled on the page.
    let y;
    if (touch && evt.touches && evt.touches.length > 0) {
      evt.preventDefault();
      y = evt.touches[0].clientY;
    } else if (mouseDown) {
      y = evt.clientY;
    } else {
      // NOTE: There can be cases where the mouse is moved, but without prior
      // click on the component. In this case we don't want to move at all.
      return;
    }
    this.calcHeight(pageY, this.screenHeight());
  }
  render() {
    const { children } = this.props;
    let { style, onClose } = this.props;
    const { height, mouseDown, touch, stage } = this.state;
    let defaultHeight;

    if (stage === "hide") {
      defaultHeight = "0px";
    } else if (stage === "hint") {
      defaultHeight = "35%";
    } else {
      defaultHeight = "100%";
    }

    style = parseFloat(height)
      ? { ...style, height }
      : { ...style, ...{ height: defaultHeight } };

    style = !(mouseDown || touch)
      ? { ...style, ...{ transition: `height ${transitionSpeed}  ease-in` } }
      : style;

    // NOTE: If we set the dock to bottom: 0 permanently and the user added a
    // border, this border would show up in hidden mode as the border extends
    // outside of an element's box. Hence, we set it it -10% to make sure it's
    // of display while still preserving the height transition.
    style = stage === "hide" ? { ...style, ...{ bottom: "-10%" } } : style;

    return html`
      <div
        class=${classes.touchableDock}
        style=${style}>
          <div
            class=${classes.touchableDockHandle}
            onMouseDown=${() => this.setState({ mouseDown: true })}
            onTouchStart=${() => this.setState({ touch: true })}>
            <span
              class=${classes.closeAction}
              onClick=${() => this.setStage("hide")}>
              ×
            </span>
          </div>
        <!-- we only mount the dock's children, when its mounted. That way,
        children can use react's componentWillUnmount method -->
        ${stage !== "hide" ? children : null}
      </div>
    `;
  }
}

export default TouchableDock;
