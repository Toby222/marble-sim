import React from "react";
// eslint-disable-next-line @typescript-eslint/no-unused-vars
import decomp from "poly-decomp";

import Head from "next/head";
import { Scene } from "../components/Scene";

export default class MarbleSim extends React.Component {
  render() {
    return (
      <>
        <Head>
          <title>Marbles 4 Catgirls</title>
        </Head>
        <Scene />
      </>
    );
  }
}
