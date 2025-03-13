import XCTest
import SwiftTreeSitter
import TreeSitterHtmlJinja2

final class TreeSitterHtmlJinja2Tests: XCTestCase {
    func testCanLoadGrammar() throws {
        let parser = Parser()
        let language = Language(language: tree_sitter_htmljinja2())
        XCTAssertNoThrow(try parser.setLanguage(language),
                         "Error loading HtmlJinja2 grammar")
    }
}
