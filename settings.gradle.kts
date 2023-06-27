/*
 * Copyright (C) 2022 Dremio
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

import java.util.Properties

includeBuild("build-logic") { name = "nessie-build-logic" }

if (!JavaVersion.current().isCompatibleWith(JavaVersion.VERSION_11)) {
  throw GradleException("Build requires Java 11")
}

val baseVersion = file("version.txt").readText().trim()

pluginManagement {
  repositories {
    mavenCentral() // prefer Maven Central, in case Gradle's repo has issues
    gradlePluginPortal()
    if (System.getProperty("withMavenLocal").toBoolean()) {
      mavenLocal()
    }
  }
}

gradle.beforeProject {
  version = baseVersion
  group = "org.projectnessie.nessie.ui"
}

include("nessie-ui")

rootProject.name = "nessie-ui-root"
