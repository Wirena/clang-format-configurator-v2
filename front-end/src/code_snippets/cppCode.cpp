#include <iostream>
// IndentPPDirectives
#ifdef WIN32
#include <windows.h>
#endif
// SortIncludes
#include "AnotherHeader.h"
#include "MyHeader.h"
#include <boost/asio/io_context.hpp>
#include <boost/asio/ip/tcp.hpp>
#include <boost/asio/signal_set.hpp>
#include <boost/asio/write.hpp>
#include <map>
#include <string>
#include <vector>

// AlignConsecutiveMacros
#define SHORT_NAME 42
#define LONGER_NAME 0x007f
#define EVEN_LONGER_NAME (2)
#define fooo(x) (x * x)
#define baar(y, z) (y + z)

// AlignEscapedNewlines
#define PPP                                                                    \
  int aaaa;                                                                    \
  int b;                                                                       \
  int dddddddddd;

namespace LevelOneNamespace {
namespace LevelTwoNamespace {

struct AAAAAAAAAAAAAAAAAAAA {
  // AlignConsecutiveDeclarations
  int a;
  int bbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbb;
  std::string cccccccccccccccccc;
};

// AlwaysBreakTemplateDeclarations
template <typename T> T foo() {}

template <typename T>
T foo(int aaaaaaaaaaaaaaaaaaaaa, int bbbbbbbbbbbbbbbbbbbbb) {}

// AllowShortEnumsOnASingleLine
enum : unsigned int { AA = 0, BB } myEnum;

// SpaceBeforeInheritanceColon
class B : public E {
private:
  // AlignArrayOfStructures
  struct AAAAAAAAAAAAAAAAAAAA test[3] = {
      {56, 23, "hello"}, {-1, 93463, "world"}, {7, 5, "!!"}};

  // AlignTrailingComments, AlignConsecutiveDeclarations, QualifierOrder,
  // QualifierAlignment, AlignTrailingComments
  static char const *variable; // very important variable
  void *const *x = nullptr;    // not so important variable
  char const *anotherVariable; // another comment
  int a = 1;                   // another variable
  // used for this, this, and that
  int longComplicatedName = 4;
  int b = 3;

protected:
  // AlwaysBreakAfterReturnType, QualifierAlignment
  constexpr static inline int function(int a, int b) { return (a + b) / 2; }

  // AllowShortFunctionsOnASingleLine
  static bool shortFilter(AAAAAAAAAAAAAAAAAAAA v) { return v.a != 4; }

  void empty() {}

  // IndentWrappedFunctionNames
  std::map<std::basic_string<wchar_t>, std::vector<std::pair<char, int>>>
  func(AAAAAAAAAAAAAAAAAAAA *v);

public:
  // SpaceBeforeCtorInitializerColon
  explicit B() : a(9){};

  // PackConstructorInitializers
  explicit B(int _a, int _b, int _c, std::vector<std::string> str)
      : a(_a), b(_b), longComplicatedName(_c), anotherVariable(str[0].c_str()) {
    // AllowShortIfStatementsOnASingleLine, SpaceBeforeParens
    if (_c)
      anotherVariable = nullptr;
    if (_a)
      anotherVariable = "baz";
    else
      anotherVariable = "bar";
  }

  // AllowAllParametersOfDeclarationOnNextLine BinPackParameters
  int myFunction(int aaaaaaaaaaaaa, int bbbbbbbbbbbbbbbbbbbbbbb,
                 int ccccccccccccc, int d, int e) {
    int myvar = aaaaaaaaaaaaa / 10;
    long anothervaw = d % 2;
    // comment
    char *msg = "Hello all";

    // AlignOperands
    myvar = bbbbbbbbbbbbbbbbbbbbbbb + ccccccccccccc + aaaaaaaaaaaaa;

    // AllowShortCaseLabelsOnASingleLine, SpaceBeforeParens
    switch (e) {
    case 1:
      return e;
    case 2:
      return 2;
    };

    // AllowShortBlocksOnASingleLine, SpaceBeforeParens
    while (true) {
    }
    while (true) {
      continue;
    }
  }

  // AlignAfterOpenBracket, BinPackParameters,
  void loooonFunctionIsVeryLongButNotAsLongAsJavaTypeNames(
      std::vector<AAAAAAAAAAAAAAAAAAAA> const &inputVector,
      std::map<int, std::string> *outputMap) {
    std::vector<AAAAAAAAAAAAAAAAAAAA> bar;
    std::copy_if(inputVector.begin(), inputVector.end(),
                 std::back_inserter(bar), &shortFilter);
    // AllowShortLambdasOnASingleLine
    std::sort(inputVector.begin(), inputVector.end(),
              [](auto v) { return v.a < v.b; });
    std::transform(inputVector.begin(), inputVector.end(),
                   std::inserter(*outputMap, outputMap->end()),
                   [](const AAAAAAAAAAAAAAAAAAAA &element) {
                     // LambdaBodyIndentation
                     return std::make_pair(
                         element.bbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbb,
                         element.cccccccccccccccccc);
                   });
  };
  int notInline(AAAAAAAAAAAAAAAAAAAA *v);
};

// AllowShortFunctionsOnASingleLine
int notInline(AAAAAAAAAAAAAAAAAAAA *v) { return v->a + 1; }

} // namespace LevelTwoNamespace
} // namespace LevelOneNamespace

int main() {
  // ReflowComments
  // veryVeryVeryVeryVeryVeryVeryVeryVeryVeryVeryLongComment with plenty of
  // information
  /* second veryVeryVeryVeryVeryVeryVeryVeryVeryVeryVeryLongComment with plenty
   * of information */

  // SortUsingDeclarations
  using std::cin;
  using std::cout;

  int aaaaaaaaaaaaaaaaaaa, bbbbbbbbbbb, ppppppppppp, eeeee;
  // AlignConsecutiveAssignments
  aaaaaaaaaaaaaaaaaaa = 6;
  bbbbbbbbbbb = 5;
  ppppppppppp = 10;
  LevelOneNamespace::LevelTwoNamespace::B b{
      1, 3, 4,
      // SpaceBeforeCpp11BracedList
      std::vector<std::string>{"aaaaaaaaaaaaaaaa", "bbbbbbbbbbbbbbbbbbbbbb",
                               "cccccccccccccccccccccccccccc"}};
  // AllowShortLoopsOnASingleLine
  for (int i = 0; i < 10; i++)
    cout << i;
  LevelOneNamespace::LevelTwoNamespace::AAAAAAAAAAAAAAAAAAAA
      ddddddddddddddddddddddddd{5, 5, "ff"};
  b.notInline(ddddddddddddddddddddddddd);
  // SpaceAfterCStyleCast, AllowAllArgumentsOnNextLine
  cout << (bool)b.myFunction(aaaaaaaaaaaaaaaaaaa, bbbbbbbbbbb, ppppppppppp,
                             eeeee, 0);

  return 0;
}
