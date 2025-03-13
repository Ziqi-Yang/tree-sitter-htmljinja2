// swift-tools-version:5.3
import PackageDescription

let package = Package(
    name: "TreeSitterHtmlJinja2",
    products: [
        .library(name: "TreeSitterHtmlJinja2", targets: ["TreeSitterHtmlJinja2"]),
    ],
    dependencies: [
        .package(url: "https://github.com/ChimeHQ/SwiftTreeSitter", from: "0.8.0"),
    ],
    targets: [
        .target(
            name: "TreeSitterHtmlJinja2",
            dependencies: [],
            path: ".",
            sources: [
                "src/parser.c",
                // NOTE: if your language has an external scanner, add it here.
            ],
            resources: [
                .copy("queries")
            ],
            publicHeadersPath: "bindings/swift",
            cSettings: [.headerSearchPath("src")]
        ),
        .testTarget(
            name: "TreeSitterHtmlJinja2Tests",
            dependencies: [
                "SwiftTreeSitter",
                "TreeSitterHtmlJinja2",
            ],
            path: "bindings/swift/TreeSitterHtmlJinja2Tests"
        )
    ],
    cLanguageStandard: .c11
)
