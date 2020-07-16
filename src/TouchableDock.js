import { h, Component } from "preact";
import htm from "htm";

const html = htm.bind(h);

const transitionSpeed = ".1s";

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

    this.setStage(this.props.stage);
  }

  setStage(stage) {
    this.setState({ height: 0, stage });
  }

  componentDidUpdate(prevProps, prevState) {
    if (
      prevProps.stage !== this.props.stage
    ) {
      this.setStage(this.props.stage);
    }

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
    return (
      window.innerHeight ||
      document.documentElement.clientHeight ||
      document.body.clientHeight
    );
  }
  calcHeight(pageY, screenHeight) {
    const height = ((screenHeight - pageY) / screenHeight) * 100;
    this.setState({
      height: height + "%"
    });
  }
  handleMovement(evt) {
    evt.preventDefault();

    const { touch, mouseDown } = this.state;

    let pageY;
    if (touch && evt.touches && evt.touches.length > 0) {
      pageY = evt.touches[0].pageY;
    } else if (mouseDown) {
      pageY = evt.pageY;
    } else {
      // NOTE: There can be cases where the mouse is moved, but without prior
      // click on the component. In this case we don't want to move at all.
      return;
    }
    this.calcHeight(pageY, this.screenHeight());
  }
  render() {
    let { style } = this.props;
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

    return html`
      <div
        class="touchable-dock"
        style=${style}>
        ${
          stage === "hint" || stage === "full"
            ? html`
          <div
            class="touchable-dock--handle"
						onMouseDown=${() => this.setState({ mouseDown: true })}
						onTouchStart=${() => this.setState({ touch: true })}>
          </div>`
            : null
        }
      </div>
    `;
  }
}

export default TouchableDock;
