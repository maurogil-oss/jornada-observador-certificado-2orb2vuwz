/* Main entry point for the application - renders the root React component */
import { createRoot } from 'react-dom/client'
import App from './App.tsx'
import './main.css'

// Global DOM monkey-patch: Prevents Google Translate, password managers (Bitwarden, 1Password, etc.)
// or browser autofill extensions from causing React to crash with:
// "Failed to execute 'removeChild' on 'Node': The node to be removed is not a child of this node."
if (typeof Node === 'function' && Node.prototype) {
  const originalRemoveChild = Node.prototype.removeChild
  Node.prototype.removeChild = function <T extends Node>(child: T): T {
    if (child.parentNode !== this) {
      if (console) {
        console.warn(
          'Prevented DOM removeChild crash: node is not a child of parentNode.',
          child,
          this,
        )
      }
      if (child.parentNode) {
        return child.parentNode.removeChild(child) as T
      }
      try {
        return originalRemoveChild.apply(this, [child]) as T
      } catch {
        return child
      }
    }
    return originalRemoveChild.apply(this, [child]) as T
  }

  const originalInsertBefore = Node.prototype.insertBefore
  Node.prototype.insertBefore = function <T extends Node>(
    newNode: T,
    referenceNode: Node | null,
  ): T {
    if (referenceNode && referenceNode.parentNode !== this) {
      if (console) {
        console.warn(
          'Prevented DOM insertBefore crash: reference node is not a child of parentNode.',
          referenceNode,
          this,
        )
      }
      return originalInsertBefore.apply(this, [newNode, null]) as T
    }
    return originalInsertBefore.apply(this, [newNode, referenceNode]) as T
  }
}

// @skip-protected: Do not remove. Required for React rendering.
createRoot(document.getElementById('root')!).render(<App />)
