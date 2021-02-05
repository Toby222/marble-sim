import React from "react";

import Head from "next/head";
import { Scene } from "../components/Scene";

export default class MarbleSim extends React.Component {
  render() {
    return (
      <>
        <Head>
          <title>Marbles 4 Catgirls</title>
        </Head>
        <>
          <div id="toolbar">Test</div>
          <Scene />
        </>
      </>
    );
  }
}
