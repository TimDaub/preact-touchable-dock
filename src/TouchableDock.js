import { h, Component } from "preact";
import htm from "htm";

const html = htm.bind(h);

class TouchableDock extends Component {
  // TODO:
  // - When dragged slightly over hint stage, proceed to full stage
  // - Add a close button to the left
  // - When clicked on any content, expand to full
  // - add mouseMove listeners too
  // - Spin out in its own npm package
  constructor(props) {
    super(props);
    this.state = {
      height: 0
    };

    this.handleTouchMove = this.handleTouchMove.bind(this);
  }

  screenHeight() {
    return (
      window.innerHeight ||
      document.documentElement.clientHeight ||
      document.body.clientHeight
    );
  }

  handleTouchMove(evt) {
    evt.preventDefault();

    const { pageY } = evt.touches[0];

    const height = ((this.screenHeight() - pageY) / this.screenHeight()) * 100;
    this.setState({
      height: height + "vh"
    });
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
            onTouchMove=${this.handleTouchMove}>
						hello
          </div>`
            : null
        }
      </div>
    `;
  }
}

export default TouchableDock;
