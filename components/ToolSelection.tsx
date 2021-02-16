import React from "react";
import { AnyTool } from "../lib/tool/BaseTool";
import { Util } from "../lib/Util";

interface Props {
  onSelected: (tool: AnyTool) => void;
}

interface State {
  selectedTool: AnyTool | null;
}

export class ToolSelection extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);

    this.state = {
      selectedTool: null,
    };
  }

  render() {
    return (
      <>
        <label htmlFor="tools">Select a tool</label>
        &nbsp;
        <select
          name="tools"
          onChange={(ev) => {
            this.props.onSelected(Util.tools[parseInt(ev.target.value)]);
          }}
        >
          {Util.tools.map((tool, i) => (
            <option key={i} value={i}>
              {tool.toString()}
            </option>
          ))}
        </select>
      </>
    );
  }
}
