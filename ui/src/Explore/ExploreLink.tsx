/*
 * Copyright (C) 2020 Dremio
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
import React from "react";
import { Link } from "react-router-dom";

interface IExploreLink {
  path: string[];
  toRef: string;
  type: "CONTAINER" | "OBJECT";
  className?: string;
  children?: React.ReactChild | React.ReactChild[];
}
const ExploreLink = ({
  path,
  toRef,
  type,
  className,
  children,
}: IExploreLink): React.ReactElement => {
  path = path || [];
  const currentRef = toRef;
  const prefix = type === "CONTAINER" ? "/tree/" : "/contents/";
  return (
    <Link to={`${prefix}${currentRef}/${path.join("/")}`} className={className}>
      {children}
    </Link>
  );
};

ExploreLink.defaultProps = {
  type: "CONTAINER",
  path: [],
};

export default ExploreLink;
