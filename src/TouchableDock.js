import { h, Component } from "preact";
import htm from "htm";

const html = htm.bind(h);

class TouchableDock extends Component {
  // TODO:
  // - When dragged slightly over hint stage, proceed to full stage
	// - Give drag function a decay function
  // - Add a close button to the left
  // - When clicked on any content, expand to full
  constructor(props) {
    super(props);
    this.state = {
      height: 0,
      mouseDown: false
    };

    this.handleMovement = this.handleMovement.bind(this);
  }
  componentDidMount() {
    document.addEventListener("mouseup", () =>
      this.setState({ mouseDown: false })
    );
    document.addEventListener("mousemove", this.handleMovement);
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
      height: height + "vh"
    });
  }
  handleMovement(evt) {
    evt.preventDefault();

    const { mouseDown } = this.state;

    let pageY;
    if (evt.touches && evt.touches.length > 0) {
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
    const { style, stage } = this.props;
    let { height } = this.state;
    let defaultHeight;

    if (stage === "hide") {
      defaultHeight = "0px";
    } else if (stage === "hint") {
      defaultHeight = "35vh";
    } else {
      defaultHeight = "100vh";
    }

    const adjustedStyle = height
      ? { ...style, height }
      : { ...style, ...{ height: defaultHeight } };

    return html`
      <div
        class="touchable-dock"
        style=${adjustedStyle}>
        ${
          stage === "hint" || stage === "full"
            ? html`
          <div
            class="touchable-dock--handle"
            onTouchMove=${this.handleMovement}
						onMouseDown=${() => this.setState({ mouseDown: true })}>
          </div>`
            : null
        }
      </div>
    `;
  }
}

export default TouchableDock;
