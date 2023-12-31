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

plugins {
  `java-library`
  `maven-publish`
  signing
  id("nessie-ui-conventions")
}

description = "Nessie Web UI"

val syncResources = tasks.register<Sync>("syncWebResources") {
  from("../build")
  into("build/resources/main/META-INF/resources")
}

tasks.withType<Jar>().configureEach {
  dependsOn(syncResources)
  manifest {
    attributes["Implementation-Title"] = "Nessie ${project.name}"
    attributes["Implementation-Version"] = project.version
    attributes["Implementation-Vendor"] = "Dremio"
  }
  duplicatesStrategy = DuplicatesStrategy.WARN
}

plugins.withType<JavaPlugin>().configureEach {
  configure<JavaPluginExtension> {
    withJavadocJar()
    withSourcesJar()
  }
}

tasks.withType<JavaCompile>().configureEach { options.release.set(8) }
