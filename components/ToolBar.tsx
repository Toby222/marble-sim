import React, { FormEvent } from "react";
import { AnyTool } from "../lib/tool/BaseTool";
import { Scene } from "./Scene";
import { ToolSelection } from "./ToolSelection";

interface Props {
  scene: Scene;
}

export class ToolBar extends React.Component<Props> {
  static readonly divider = " | ";
  render() {
    const scene = this.props.scene;

    return (
      <>
        <div id="toolbar" ref={scene.toolbar}>
          <span ref={scene.fpsCounter} />
          {ToolBar.divider}
          <ToolSelection
            onSelected={(tool: AnyTool) => scene.setState({ tool })}
          />
          <label htmlFor="change-speed">Adjust speed:</label>
          <input
            name="change-speed"
            type="range"
            min={0}
            max={100}
            defaultValue={30}
            onInput={(event: FormEvent<HTMLInputElement>) => {
              const value = (event.target as HTMLInputElement).valueAsNumber;
              scene.runner.options.speed = value;
            }}
          />{" "}
          {ToolBar.divider}
          <label htmlFor="edge-delete">Remove Bodies at the edge</label>
          <input
            type="checkbox"
            name="edge-delete"
            defaultChecked={false}
            onInput={(event: FormEvent<HTMLInputElement>) => {
              const checked = (event.target as HTMLInputElement).checked;
              for (
                let edge = scene.edge.getFixtureList();
                edge;
                edge = edge.getNext()
              ) {
                edge.setSensor(checked);
              }
            }}
          />{" "}
          {ToolBar.divider}
          <label htmlFor="wireframe-render">Render bodies as wireframes</label>
          <input
            type="checkbox"
            name="wireframe-render"
            defaultChecked={false}
            onInput={(event: FormEvent<HTMLInputElement>) => {
              const checked = (event.target as HTMLInputElement).checked;
              scene.renderer.options.wireframe = checked;
            }}
          />
        </div>
      </>
    );
  }
}
